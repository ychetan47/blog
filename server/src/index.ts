import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.js';
import postsRouter from './routes/posts.routes.js';
import libraryRouter from './routes/library.routes.js';
import usersRouter from './routes/users.routes.js';
import categoriesRouter from './routes/categories.routes.js';
import onboardingRouter from './routes/onboarding.routes.js';
import settingsRouter from './routes/settings.routes.js';
import unsplashRouter from './routes/unsplash.routes.js';
import { subcategoriesRouter } from './routes/subcategories.routes.js';
import { seedTaxonomy } from './lib/seedTaxonomy.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        origin === CLIENT_ORIGIN ||
        origin === 'http://localhost:3000' ||
        origin === 'http://127.0.0.1:3000'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive origin with credentials
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Request logging in dev
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/stories', postsRouter);
app.use('/api/library', libraryRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/subcategories', subcategoriesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/unsplash', unsplashRouter);

// Initialize taxonomy asynchronously on boot
seedTaxonomy().catch((err) => console.error('Error auto-seeding taxonomy:', err));

// Global Error Handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

app.listen(PORT, () => {
  console.log(`🌿 The Margin Node.js backend running on http://localhost:${PORT}`);
});
