// SPDX-License-Identifier: Apache-2.0
import type { Request, Response, NextFunction } from 'express';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

export interface ISidecarProxyOptions {
  /** Target backend URL (e.g. 'http://localhost:8001' or 'https://api.internal:8001') */
  target: string;
  /** Strip path prefix before forwarding (e.g. '^/api/python' -> '') */
  pathRewrite?: Record<string, string>;
  /** Change Host header to match target */
  changeOrigin?: boolean;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Optional headers injected into every proxied request (e.g. X-Internal-API-Key) */
  extraHeaders?: Record<string, string> | (() => Record<string, string>);
  /** Custom error handler */
  onError?: (err: Error, req: Request, res: Response) => void;
}

/**
 * Strict response header allowlist forwarded from internal sidecar responses.
 * Prevents the sidecar from ever overwriting Middleware #1 Observatory 125+ headers
 * (CSP, HSTS, COOP, CORP, COEP, Permissions-Policy, Origin-Agent-Cluster, etc.).
 */
const ALLOWED_RESPONSE_HEADERS = new Set<string>([
  'content-type',
  'cache-control',
  'content-disposition',
  'x-request-id',
  'x-hipaa-safe-harbor',
  'x-accel-buffering'
]);

/**
 * Hop-by-hop and credential headers stripped before forwarding to the internal sidecar.
 */
const STRIPPED_UPSTREAM_HEADERS = new Set<string>([
  'cookie',
  'authorization',
  'proxy-authorization',
  'connection',
  'keep-alive',
  'proxy-connection',
  'te',
  'trailer',
  'upgrade'
]);

/**
 * High-performance, zero-dependency HTTP reverse proxy middleware.
 * Streams request and response bodies directly between Express and backend services (e.g. Python FastAPI).
 * Eliminates all CVE vulnerabilities and supply-chain dependencies of external proxy libraries.
 */
export function createSidecarProxy(options: ISidecarProxyOptions) {
  const targetUrl = new URL(options.target);
  const isHttps = targetUrl.protocol === 'https:';
  const transport = isHttps ? https : http;
  const timeoutMs = options.timeoutMs ?? 30000;

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      let forwardedPath = req.originalUrl || req.url;

      // Apply path rewriting rules
      if (options.pathRewrite) {
        for (const [pattern, replacement] of Object.entries(options.pathRewrite)) {
          const regex = new RegExp(pattern);
          forwardedPath = forwardedPath.replace(regex, replacement);
        }
      }

      // Ensure single leading slash
      if (!forwardedPath.startsWith('/')) {
        forwardedPath = '/' + forwardedPath;
      }

      const targetPath = forwardedPath;

      // Copy request headers while strictly stripping cookies/authorization credentials
      const headers: http.OutgoingHttpHeaders = {};
      for (const [key, val] of Object.entries(req.headers)) {
        const lowerKey = key.toLowerCase();
        if (STRIPPED_UPSTREAM_HEADERS.has(lowerKey)) continue;
        if (val !== undefined) {
          headers[lowerKey] = val;
        }
      }

      if (options.changeOrigin !== false) {
        headers['host'] = targetUrl.host;
      }

      if (options.extraHeaders) {
        const dynamicHeaders =
          typeof options.extraHeaders === 'function' ? options.extraHeaders() : options.extraHeaders;
        for (const [hKey, hVal] of Object.entries(dynamicHeaders)) {
          if (hVal) {
            headers[hKey.toLowerCase()] = hVal;
          }
        }
      }

      // Add standard reverse proxy headers
      const clientIp = req.ip || req.socket?.remoteAddress;
      if (clientIp) {
        const existingXff = req.headers['x-forwarded-for'];
        headers['x-forwarded-for'] = existingXff ? `${existingXff}, ${clientIp}` : clientIp;
      }
      headers['x-forwarded-proto'] = req.protocol || 'http';
      headers['x-forwarded-host'] = req.headers['host'] || targetUrl.host;

      // Re-serialize body whenever upstream express.json()/urlencoded() already consumed the stream
      // (including empty {} objects, [] arrays, strings, buffers, or already-ended streams — prevents hang)
      const isBodyMethod = req.method !== 'GET' && req.method !== 'HEAD';
      let preParsedBody: Buffer | null = null;
      let streamAlreadyConsumed = Boolean(req.readableEnded);

      if (isBodyMethod && req.body !== undefined) {
        if (Buffer.isBuffer(req.body)) {
          preParsedBody = req.body;
          streamAlreadyConsumed = true;
        } else if (typeof req.body === 'string') {
          preParsedBody = Buffer.from(req.body, 'utf8');
          streamAlreadyConsumed = true;
        } else if (typeof req.body === 'object' && req.body !== null) {
          // Handles populated objects, empty `{}` objects, AND arrays `[]`
          preParsedBody = Buffer.from(JSON.stringify(req.body), 'utf8');
          streamAlreadyConsumed = true;
        }
      }

      if (preParsedBody !== null) {
        headers['content-type'] = headers['content-type'] || 'application/json; charset=utf-8';
        headers['content-length'] = String(preParsedBody.byteLength);
        delete headers['transfer-encoding'];
      } else if (streamAlreadyConsumed && isBodyMethod) {
        headers['content-length'] = '0';
        delete headers['transfer-encoding'];
      }

      const proxyReq = transport.request(
        {
          protocol: targetUrl.protocol,
          hostname: targetUrl.hostname,
          port: targetUrl.port || (isHttps ? 443 : 80),
          method: req.method,
          path: targetPath,
          headers,
          timeout: timeoutMs
        },
        (proxyRes) => {
          // Forward status code
          res.status(proxyRes.statusCode || 200);

          // Strictly forward only allowlisted response headers so Observatory 125+ headers stay intact
          for (const [key, value] of Object.entries(proxyRes.headers)) {
            const lowerKey = key.toLowerCase();
            if (value !== undefined && ALLOWED_RESPONSE_HEADERS.has(lowerKey)) {
              res.setHeader(lowerKey, value);
            }
          }

          // Pipe response stream directly
          proxyRes.pipe(res);
        }
      );

      proxyReq.on('timeout', () => {
        proxyReq.destroy(new Error(`Proxy request timeout after ${timeoutMs}ms`));
      });

      proxyReq.on('error', (err: Error) => {
        if (options.onError) {
          options.onError(err, req, res);
        } else {
          if (!res.headersSent) {
            res.status(503).json({
              error: 'Service unavailable',
              details: err.message
            });
          }
        }
      });

      // Stream request body (or end immediately when upstream body-parser already drained the stream)
      if (preParsedBody !== null) {
        proxyReq.end(preParsedBody);
      } else if (streamAlreadyConsumed || !isBodyMethod) {
        proxyReq.end();
      } else {
        req.pipe(proxyReq);
      }
    } catch (err) {
      if (options.onError && err instanceof Error) {
        options.onError(err, req, res);
      } else {
        next(err);
      }
    }
  };
}
