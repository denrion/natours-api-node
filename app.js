import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import path from 'path';
import xss from 'xss-clean';
import globalErrorHandler from './controllers/errorController.js';
import { authRouter } from './routes/authRoutes.js';
import { bookingRouter } from './routes/bookingRoutes.js';
import { reviewRouter } from './routes/reviewRoutes.js';
import { tourRouter } from './routes/tourRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { viewRouter } from './routes/viewRoutes.js';
import NotImplementedError from './utils/errors/NotImplementedError.js';

dotenv.config();

const app = express();

// Enable proxies to allow HTTPS over HEROKu
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.resolve('views'));

app.use(express.static(path.resolve('public')));

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

// Cookie Parser, enables reading incoming cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization agains XSS
app.use(xss());

// Prevent http parameter polution
// specify parameters that are allowed to be repeated
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// CORS
app.use(cors({ credentials: true }));

// Compress sent JSON data
app.use(compression());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ROUTES

app.use('/', viewRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Serve static assets in produciton
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.resolve('public')));

//   app.get('*', (req, res, next) => {
//     res.sendFile(path.resolve('public', 'overview.html'));
//   });
// }

app.all('*', (req, res, next) => {
  next(
    new NotImplementedError(`Cannot find ${req.originalUrl} on this server!`)
  );
});

app.use(globalErrorHandler);

export default app;
