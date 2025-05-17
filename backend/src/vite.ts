
import { ViteDevServer } from 'vite';
import { Express } from 'express';
import path from 'path';

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
