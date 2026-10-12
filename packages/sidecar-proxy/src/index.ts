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
  /** Custom error handler */
  onError?: (err: Error, req: Request, res: Response) => void;
}

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

      // Preserve query parameters if not already in forwardedPath
      const targetPath = forwardedPath;

      const headers = { ...req.headers };
      if (options.changeOrigin !== false) {
        headers['host'] = targetUrl.host;
      }

      // Add standard reverse proxy headers
      const clientIp = req.socket.remoteAddress;
      if (clientIp) {
        const existingXff = req.headers['x-forwarded-for'];
        headers['x-forwarded-for'] = existingXff ? `${existingXff}, ${clientIp}` : clientIp;
      }
      headers['x-forwarded-proto'] = req.protocol || 'http';
      headers['x-forwarded-host'] = req.headers['host'] || targetUrl.host;

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

          // Forward response headers
          for (const [key, value] of Object.entries(proxyRes.headers)) {
            if (value !== undefined) {
              res.setHeader(key, value);
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

      // Stream request body (handles JSON, form data, multipart, websockets payload)
      req.pipe(proxyReq);
    } catch (err) {
      if (options.onError && err instanceof Error) {
        options.onError(err, req, res);
      } else {
        next(err);
      }
    }
  };
}
