import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import rateLimit from 'express-rate-limit';

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:4200,http://127.0.0.1:4200')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (no Origin header), block unknown browser origins.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));

// Apply Hue Bridge recommended rate limit: maximum 10 requests per second to avoid bridge overload
const hueLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10,
  message: { error: 'Too many requests sent to the Hue Bridge. Rate limited to 10 req/sec to prevent bridge freeze.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/hue/', hueLimiter);
app.use(express.json());

const PORT = 8080;

console.log(`
======================================================
  POCKET GULL - LOCAL HUE RELAY
======================================================
This relay bypasses "Mixed Content" browser restrictions.
When Pocket Gull is hosted on Cloud Run (HTTPS), it cannot
directly talk to your Hue Bridge (HTTP / local IP).
This script runs locally on your machine, receives secure
requests on localhost, and proxies them to the Hue Bridge.
======================================================
`);

app.put('/api/hue/:bridgeIp/api/:username/lights/:lightId/state', async (req, res) => {
  const { bridgeIp, username, lightId } = req.params;

  // Validate parameters to prevent Server-Side Request Forgery (SSRF)
  const isValidUsername = /^[a-zA-Z0-9_\-]+$/.test(username);
  const isValidLightId = /^[0-9]+$/.test(lightId);

  // Enforce that bridgeIp is strictly localhost or a private local subnet IP to prevent SSRF
  const isPrivateIp = (ip) => {
    if (ip === 'localhost' || ip === '127.0.0.1') return true;
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return false;
    return (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127
    );
  };

  const isValidIp = (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(bridgeIp) && isPrivateIp(bridgeIp)) || bridgeIp === 'localhost';

  if (!isValidIp || !isValidUsername || !isValidLightId) {
    return res.status(400).json({ error: 'Invalid parameters provided. SSRF check failed.' });
  }

  const targetUrl = new URL(`http://${bridgeIp}/api/${username}/lights/${lightId}/state`);

  try {
    const response = await fetch(targetUrl.href, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`[Hue Relay] Error sending to bridge:`, error.message);
    res.status(500).json({ error: 'Failed to contact Hue Bridge.' });
  }
});

app.listen(PORT, () => {
  console.log(`[READY] Hue Relay is listening on http://localhost:${PORT}`);
  console.log(`Update your application settings to use this relay if hosted in the cloud.`);
});
