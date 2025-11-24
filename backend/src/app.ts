import express, { Express } from 'express';
// Force restart
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { applySecurityMiddleware, authRateLimiter } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authenticate } from './middlewares/auth';
import { requestLogger } from './middlewares/requestLogger';
import { performanceMonitor } from './middlewares/performance';

import authRouter from './routes/auth.routes';
import tournamentRouter from './routes/tournament.routes';
import playerRouter from './routes/player.routes';
import clubRouter from './routes/club.routes';
import eventRouter from './routers/eventRouter';
import fixtureRouter from './routers/fixtureRouter';
import scheduleRouter from './routers/scheduleRouter';
import leaderboardRouter from './routers/leaderboardRouter';
import matchRouter from './routers/matchRouter';
import analyticsRouter from './routers/analyticsRouter';
import geminiRouter from './routes/gemini.routes';

export const app: Express = express();

applySecurityMiddleware(app);

app.use(performanceMonitor);
app.use(requestLogger);
app.use(json({ limit: '10mb' }));
app.use(cookieParser());

app.use(authenticate);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
  });
});

app.use('/api/auth', authRateLimiter, authRouter);
app.use('/api/tournaments', tournamentRouter);
app.use('/api/players', playerRouter);
app.use('/api/clubs', clubRouter);
app.use('/api/events', eventRouter);
app.use('/api', fixtureRouter);
app.use('/api', leaderboardRouter);
app.use('/api', analyticsRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/matches', matchRouter);
app.use('/api/ai', geminiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
