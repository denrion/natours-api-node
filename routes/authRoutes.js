import express from 'express';
import {
  forgotPassword,
  login,
  resetPassword,
  singup,
} from '../controllers/authController.js';

const router = express.Router();

// router.get('/me')
router.post('/signup', singup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export { router as authRouter };
