import express from 'express';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMontlyPlan,
  getTour,
  getTourStats,
  updateTour,
} from '../controllers/tourController.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMontlyPlan);

router.route('/').get(isAuth, getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export { router as tourRouter };
