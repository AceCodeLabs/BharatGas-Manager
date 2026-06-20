import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import { accountsRoutes } from './routes/accounts.routes';
import { ordersRoutes } from './routes/orders.routes';
import { transactionsRoutes } from './routes/transactions.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { bharatgasRoutes } from './routes/bharatgas.routes';
import { HttpError } from './utils/http';
import morgan from 'morgan';

export async function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('tiny'));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/accounts', accountsRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/transactions', transactionsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/bharatgas', bharatgasRoutes);

  app.use('/api', (_req, _res, next) => {
    next(new HttpError(404, 'API route not found'));
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Unexpected server error';

    if (status >= 500) {
      console.error(error);
    }

    res.status(status).json({ error: message });
  });

  return app;
}
