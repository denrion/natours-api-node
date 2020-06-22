import express from 'express';
import {
  deleteMe,
  forgotPassword,
  getMe,
  login,
  logout,
  resetPassword,
  resizeUserPhoto,
  signup,
  updateMe,
  updateMyPassword,
  uploadUserPhoto,
} from '../controllers/authController.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Routes below will go through isAuth middleware first
router.use(isAuth);

router.get('/me', getMe);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.patch('/updateMyPassword', updateMyPassword);
router.delete('/deleteMe', deleteMe);

export { router as authRouter };
