import status from 'http-status';
import Tour from '../models/Tour.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(status.OK).render('overview', { title: 'All tours', tours });
});

export const getTour = (req, res) => {
  res.status(status.OK).render('tour', { title: 'The Forest Hiker Tour' });
};
