import express from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/userController.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

// Routes below will go through isAuth middleware first
router.use(isAuth);

// Routes below will go through both isAuth & restrictTo middleware first
// router.use(restrictTo(Role.ADMIN));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export { router as userRouter };
