import { createServer } from 'node:https';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = import.meta.dirname;
const port = process.env.PORT ?? 8444;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const tls = { key: await readFile(join(root, 'key.pem')), cert: await readFile(join(root, 'cert.pem')) };

createServer(tls, async (req, res) => {
  try {
    const path = new URL(req.url, 'https://localhost').pathname;
    const file = path === '/' ? 'index.html' : path.slice(1);
    const type = types[extname(file)];
    if (!type || file.includes('/')) throw new Error('not served');
    const body = await readFile(join(root, file));
    res.writeHead(200, { 'Content-Type': type }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, 'localhost', () => console.log(`https://localhost:${port}/`));
