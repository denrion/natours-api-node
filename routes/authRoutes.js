import express from 'express';
import { singup } from '../controllers/authController.js';

const router = express.Router();

// router.get('/me')
router.post('/signup', singup);
// router.post('/login', login);

export { router as authRouter };
