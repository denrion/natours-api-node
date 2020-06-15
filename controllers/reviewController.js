/* eslint-disable no-unused-vars */
import Review from '../models/Review.js';
import catchAsync from '../utils/catchAsync.js';
import ResponseStatus from '../utils/responseStatus.js';

export const getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    results: reviews.length,
    data: { reviews },
  });
});

export const createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await Review.create(req.body);

  res.status(201).json({
    status: ResponseStatus.SUCCESS,
    data: { review },
  });
});

export const getReview = (req, res, next) => {
  res.status(500).json({
    status: ResponseStatus.FAILURE,
    message: 'Route not yet implemented',
  });
};

export const updateReview = (req, res, next) => {
  res.status(500).json({
    status: ResponseStatus.FAILURE,
    message: 'Route not yet implemented',
  });
};

export const deleteReview = (req, res, next) => {
  res.status(500).json({
    status: ResponseStatus.FAILURE,
    message: 'Route not yet implemented',
  });
};
