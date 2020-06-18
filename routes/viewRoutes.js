import express from 'express';
import {
  getLoginForm,
  getOverview,
  getTour,
} from '../controllers/viewController.js';
import { isLoggedIn } from '../middleware/isAuth.js';

const router = express.Router();

// Make all requests go through this middleware
router.use(isLoggedIn);

router.get('/', getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);

export { router as viewRouter };
