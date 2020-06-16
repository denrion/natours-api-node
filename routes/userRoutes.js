import express from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/userController.js';
import isAuth from '../middleware/isAuth.js';
import restrictTo from '../middleware/restrictTo.js';
import { Role } from '../models/User.js';

const router = express.Router();

// Routes below will go through both isAuth & restrictTo middleware first
router.use(isAuth, restrictTo(Role.ADMIN));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export { router as userRouter };
