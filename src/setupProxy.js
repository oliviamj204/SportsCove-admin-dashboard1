// Local development proxy to bypass CORS in dev only.
// This file is picked up automatically by react-scripts (development only).

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const target = process.env.PROXY_TARGET || 'https://sportscovetestapi.consultcraftinc.com';

  app.use(
    ['/v1', '/v1/*'],
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
      logLevel: 'warn'
    })
  );
};
