/* eslint-disable no-unused-vars */
import Review from '../models/Review.js';
import catchAsync from '../utils/catchAsync.js';
import ResponseStatus from '../utils/responseStatus.js';

export const getAllReviews = async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    results: reviews.length,
    data: { reviews },
  });
};

export const createReview = catchAsync(async (req, res, next) => {
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
