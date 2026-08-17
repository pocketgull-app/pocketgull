import express from 'express';
import { createDiscoveryRouter } from '../src/server/routes/discovery.routes';

describe('Agentic Discovery Routes (/v1/discovery & /api/discovery)', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(createDiscoveryRouter());
  });

  it('should serve WebMCP tool registry on /v1/discovery/tools', async () => {
    const res = await fetchResponse(app, '/v1/discovery/tools');
    expect(res.status).toBe(200);
    expect(res.body['@type']).toBe('AgenticToolRegistry');
    expect(res.body.totalTools).toBeGreaterThan(0);
    expect(Array.isArray(res.body.tools)).toBe(true);
  });

  it('should serve WebMCP tool registry on /api/discovery/tools alias', async () => {
    const res = await fetchResponse(app, '/api/discovery/tools');
    expect(res.status).toBe(200);
    expect(res.body['@type']).toBe('AgenticToolRegistry');
    expect(res.body.totalTools).toBeGreaterThan(0);
  });

  it('should serve context-schema on /api/discovery/context-schema', async () => {
    const res = await fetchResponse(app, '/api/discovery/context-schema');
    expect(res.status).toBe(200);
    expect(res.body.contextEnvelope).toBeDefined();
  });

  it('should serve taxonomy on /api/discovery/taxonomy', async () => {
    const res = await fetchResponse(app, '/api/discovery/taxonomy');
    expect(res.status).toBe(200);
    expect(res.body['@type']).toBe('MedicalCodeSystem');
  });

  function fetchResponse(app: express.Express, path: string): Promise<{ status: number; body: any }> {
    return new Promise((resolve) => {
      const req = {
        method: 'GET',
        url: path,
        headers: {}
      } as any;

      let statusCode = 200;
      const headers: Record<string, string> = {};
      const res = {
        setHeader(name: string, value: string) {
          headers[name] = value;
          return this;
        },
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(data: any) {
          resolve({ status: statusCode, body: data });
        }
      } as any;

      app.handle(req, res, () => {
        resolve({ status: 404, body: { error: 'Not Found' } });
      });
    });
  }
});
