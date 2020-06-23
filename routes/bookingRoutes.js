import express from 'express';
import {
  createBooking,
  deleteBooking,
  getAllBookings,
  getBooking,
  getCheckoutSession,
  updateBooking,
} from '../controllers/bookingController.js';
import isAuth from '../middleware/isAuth.js';
import restrictTo from '../middleware/restrictTo.js';
import { Role } from '../models/User.js';

const router = express.Router();

router.use(isAuth);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo(Role.ADMIN, Role.LEAD_GUIDE));

router.route('/').get(getAllBookings).post(createBooking);
router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

export { router as bookingRouter };
