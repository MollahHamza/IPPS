// Development only: forwards /api requests from the React dev server (port 3000)
// to the local API server (npm run server, port 8888). On Netlify, /api is served directly.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use('/api', createProxyMiddleware({ target: `http://localhost:${process.env.API_PORT || 8888}`, changeOrigin: true }));
};
