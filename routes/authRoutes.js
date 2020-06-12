import express from 'express';
import {
  forgotPassword,
  getMe,
  login,
  resetPassword,
  singup,
  updatePassword,
} from '../controllers/authController.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

router.post('/signup', singup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Routes below will go through isAuth middleware first
router.use(isAuth);

router.get('/me', getMe);
router.patch('/updateMyPassword', updatePassword);

export { router as authRouter };
