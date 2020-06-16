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
import setBodyFieldFromAuthUser from '../middleware/setBodyFieldFromAuthUser.js';
import setBodyFieldFromParams from '../middleware/setBodyFieldFromParam.js';
import setFindFilterFromRequest, {
  FILTER_TYPE,
} from '../middleware/setFindFilterFromRequest.js';
import { Role } from '../models/User.js';

const router = express.Router({ mergeParams: true });

// Routes below will go through isAuth middleware first
router.use(isAuth);

router
  .route('/')
  .get(
    setFindFilterFromRequest('tour', FILTER_TYPE.REQ_PARAMS, 'tourId'),
    getAllReviews
  )
  .post(
    restrictTo(Role.USER),
    setBodyFieldFromParams('tour', 'tourId'),
    setBodyFieldFromAuthUser('user'),
    createReview
  );
router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

export { router as reviewRouter };
