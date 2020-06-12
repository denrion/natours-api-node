import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import globalErrorHandler from './controllers/errorController.js';
import { authRouter } from './routes/authRoutes.js';
import { tourRouter } from './routes/tourRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import NotImplementedError from './utils/errors/NotImplementedError.js';

dotenv.config();

const app = express();

// Set security HTTP headers
app.use(helmet());

// Rate limiting - for stopping BRUTE FORCE attacks from the same IP
const limiter = rateLimit({
  max: process.env.RATE_LIMIT_MAX_NUM_CONNECTIONS,
  windowMs: process.env.RATE_LIMIT_KEEP_IN_MEMORY_LENGTH_MS,
  message: process.env.RATE_LIMIT_MESSAGE,
});

app.use('/api', limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: process.env.BODY_PARSER_SIZE_LIMIT }));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Serve static assets in produciton
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('public')));

  app.get('*', (req, res, next) => {
    res.sendFile(path.resolve('public', 'overview.html'));
  });
}

app.all('*', (req, res, next) => {
  next(
    new NotImplementedError(`Cannot find ${req.originalUrl} on this server!`)
  );
});

app.use(globalErrorHandler);

export default app;
