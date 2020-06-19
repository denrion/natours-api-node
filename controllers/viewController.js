import status from 'http-status';
import Tour from '../models/Tour.js';
import catchAsync from '../utils/catchAsync.js';
import NotFoundError from '../utils/errors/NotFoundError.js';

export const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(status.OK).render('overview', { title: 'All tours', tours });
});

export const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) return next(new NotFoundError('There is no tour with that name'));

  res.status(status.OK).render('tour', { title: `${tour.name} Tour`, tour });
});

export const getLoginForm = (req, res, next) => {
  res.status(status.OK).render('login', { title: 'Log into your account' });
};

export const getAccount = (req, res, next) => {
  res.status(status.OK).render('account', { title: 'Your account' });
};
