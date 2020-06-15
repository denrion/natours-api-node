/* eslint-disable no-unused-vars */
import Review from '../models/Review.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory.js';

// @desc      Get All Reviews
// @route     GET /api/v1/reviews
// @access    Public
export const getAllReviews = getAll(Review);

// @desc      Get Review By Id
// @route     GET /api/v1/reviews/:reviewId
// @access    Public
export const getReview = getOne(Review);

// @desc      Create New Rview
// @route     POST /api/v1/reviews
// @access    Public
export const createReview = createOne(Review);

// @desc      Update review
// @route     PATHS /api/v1/reviews/:reviewId
// @access    Public
export const updateReview = updateOne(Review);

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:reviewId
// @access    Public
export const deleteReview = deleteOne(Review);
