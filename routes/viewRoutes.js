import express from 'express';
import { createBookingCheckout } from '../controllers/bookingController.js';
import {
  getAccount,
  getLoginForm,
  getMyTours,
  getOverview,
  getTour,
} from '../controllers/viewController.js';
import isAuth, { isLoggedIn } from '../middleware/isAuth.js';

const router = express.Router();

router.get('/', createBookingCheckout, isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/me', isAuth, getAccount);
router.get('/my-tours', isAuth, getMyTours);

export { router as viewRouter };
