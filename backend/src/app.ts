import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './modules/auth/auth.routes';
import zonesRoutes from './modules/zones/zones.routes';
import rateCardsRoutes from './modules/rateCards/rateCards.routes';
import ordersRoutes from './modules/orders/orders.routes';
import agentsRoutes from './modules/agents/agents.routes';
import trackingRoutes from './modules/tracking/tracking.routes';
import { errorHandler } from './middleware/errorHandler';
import { startNotificationWorker } from './workers/notificationWorker';

const app = express();

const allowedOrigins = new Set(
  (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/\/+$/, ''))
);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');

      if (allowedOrigins.has('*') || allowedOrigins.has(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/rate-cards', rateCardsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/orders', trackingRoutes);  // /api/orders/:id/timeline

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
  // Start the background worker in the same process to process emails
  startNotificationWorker();
});

export default app;