import express from 'express';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  updateReview,
} from '../controllers/reviewController.js';
import isAuth from '../middleware/isAuth.js';
import restrictTo from '../middleware/restrictTo.js';
import { Role } from '../models/User.js';

const router = express.Router({ mergeParams: true });

// Routes below will go through isAuth middleware first
router.use(isAuth);

router.route('/').get(getAllReviews).post(restrictTo(Role.USER), createReview);
router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

export { router as reviewRouter };
