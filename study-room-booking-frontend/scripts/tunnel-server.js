const fs = require('fs');
const http = require('http');
const path = require('path');

const port = Number(process.argv[2] || process.env.PORT || 4173);
const buildDir = path.join(__dirname, 'build');

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

function proxyApi(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: 8081,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: '127.0.0.1:8081' }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('后端服务未连接');
  });

  req.pipe(proxyReq);
}

function serveStatic(req, res) {
  const rawPath = decodeURIComponent(req.url.split('?')[0]);
  const safePath = rawPath === '/' ? '/index.html' : rawPath;
  const filePath = path.normalize(path.join(buildDir, safePath));

  if (!filePath.startsWith(buildDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (!err) {
      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      res.end(data);
      return;
    }

    fs.readFile(path.join(buildDir, 'index.html'), (indexErr, indexData) => {
      if (indexErr) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexData);
    });
  });
}

http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    proxyApi(req, res);
    return;
  }
  serveStatic(req, res);
}).listen(port, '::', () => {
  console.log(`Tunnel-ready server listening on http://[::]:${port}`);
});
