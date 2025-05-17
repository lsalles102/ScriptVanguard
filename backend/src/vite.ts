import { ViteDevServer } from 'vite';
import { Express } from 'express';

export const setupVite = async (app: Express) => {
  if (process.env.NODE_ENV === 'development') {
    const vite = await import('vite');
    const viteConfig = {
      server: {
        middlewareMode: true,
        hmr: {
          port: 5173
        }
      },
      appType: 'custom'
    };

    const viteServer = await vite.createServer(viteConfig);
    app.use(viteServer.middlewares);
    return viteServer;
  }
  return null;
};