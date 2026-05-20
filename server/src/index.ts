import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './env.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import orderRoutes from './routes/orders.js';
import cardRoutes from './routes/cards.js';
import waitlistRoutes from './routes/waitlist.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/error.js';

const app = express();
const allowedOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      const isConfigured = allowedOrigins.includes(origin);
      const isLocalVite = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      callback(null, isConfigured || isLocalVite);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
