import status from 'http-status';
import Tour from '../models/Tour.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(status.OK).render('overview', { title: 'All tours', tours });
});

export const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  res.status(status.OK).render('tour', { title: `${tour.name} Tour`, tour });
});
