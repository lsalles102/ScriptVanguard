
import { ViteDevServer } from 'vite';
import { Express } from 'express';
import path from 'path';
import express from 'express';

export const setupVite = async (app: Express) => {
  if (process.env.NODE_ENV === 'development') {
    const vite = await import('vite');
    const viteServer = await vite.createServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: 5173
        }
      },
      appType: 'custom',
      root: path.resolve(process.cwd(), '../frontend')
    });
    
    app.use(viteServer.middlewares);
    return viteServer;
  }
  return null;
};

export const serveStatic = (app: Express) => {
  const distPath = path.resolve(process.cwd(), '../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
};
