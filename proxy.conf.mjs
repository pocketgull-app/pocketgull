const handleProxyError = (err, req, res) => {
  if (res && typeof res.writeHead === 'function' && !res.headersSent) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Backend service offline in client-only dev mode',
      code: err.code || 'ECONNREFUSED',
      path: req?.url
    }));
  }
};

const handleWsProxyError = (err, req, socket) => {
  if (socket && typeof socket.destroy === 'function') {
    socket.destroy();
  }
};

export default {
    "/ws/gemini-live": {
      target: "wss://generativelanguage.googleapis.com",
      secure: false,
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        "^/ws/gemini-live": "/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent"
      },
      onProxyReqWs: (proxyReq, req, socket, options, head) => {
        proxyReq.setHeader('Origin', 'https://pocketgull.app/');
        proxyReq.setHeader('Referer', 'https://pocketgull.app/');
      },
      onError: handleWsProxyError
    },
    "/api": {
      target: "http://localhost:4000",
      secure: false,
      changeOrigin: true,
      onError: handleProxyError
    },
    "/socket.io": {
      target: "http://localhost:4000",
      secure: false,
      changeOrigin: true,
      ws: true,
      onError: handleWsProxyError
    },
    "/api-docs": {
      target: "http://localhost:4000",
      secure: false,
      changeOrigin: true,
      onError: handleProxyError
    },
    "/docs/study": {
      target: "http://localhost:4000",
      secure: false,
      changeOrigin: true,
      onError: handleProxyError
    },
    "/docs": {
      target: "http://localhost:4000",
      secure: false,
      changeOrigin: true,
      onError: handleProxyError
    },
    "/api/python": {
      target: "http://localhost:8001",
      secure: false,
      changeOrigin: true,
      pathRewrite: { "^/api/python": "" },
      onError: handleProxyError
    }
  };
