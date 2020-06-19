import express from 'express';
import {
  getAccount,
  getLoginForm,
  getOverview,
  getTour,
} from '../controllers/viewController.js';
import isAuth, { isLoggedIn } from '../middleware/isAuth.js';

const router = express.Router();

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/me', isAuth, getAccount);

export { router as viewRouter };
