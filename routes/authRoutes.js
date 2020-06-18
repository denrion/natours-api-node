import express from 'express';
import {
  deleteMe,
  forgotPassword,
  getMe,
  login,
  logout,
  resetPassword,
  singup,
  updateMe,
  updateMyPassword,
} from '../controllers/authController.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

router.post('/signup', singup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Routes below will go through isAuth middleware first
router.use(isAuth);

router.get('/me', getMe);
router.patch('/updateMe', updateMe);
router.patch('/updateMyPassword', updateMyPassword);
router.delete('/deleteMe', deleteMe);

export { router as authRouter };
