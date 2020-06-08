import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { tourRouter } from './routes/tourRoutes.js';
import { userRouter } from './routes/userRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use(express.static(path.resolve('public')));

export default app;
