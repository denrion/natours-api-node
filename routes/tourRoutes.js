import express from 'express';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMontlyPlan,
  getTour,
  getTourStats,
  getToursWithin,
  updateTour,
} from '../controllers/tourController.js';
import isAuth from '../middleware/isAuth.js';
import restrictTo from '../middleware/restrictTo.js';
import { Role } from '../models/User.js';
import { reviewRouter } from './reviewRoutes.js';

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    isAuth,
    restrictTo(Role.ADMIN, Role.LEAD_GUIDE, Role.GUIDE),
    getMontlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router
  .route('/')
  .get(getAllTours)
  .post(isAuth, restrictTo(Role.ADMIN, Role.LEAD_GUIDE), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(isAuth, restrictTo(Role.ADMIN, Role.LEAD_GUIDE), updateTour)
  .delete(isAuth, restrictTo(Role.ADMIN, Role.LEAD_GUIDE), deleteTour);

export { router as tourRouter };
