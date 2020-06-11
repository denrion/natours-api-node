import status from 'http-status';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import createAndSendToken from '../utils/createAndSendToken.js';
import BadRequestError from '../utils/errors/BadRequestError.js';
import UnauthorizedError from '../utils/errors/UnauthorizedError.js';

// @desc      Signup user
// @route     POST /api/v1/auth/signup
// @access    Public
export const singup = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  const { role, photo, ...signupData } = req.body;

  const user = await User.create(signupData);

  createAndSendToken(user, status.CREATED, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new BadRequestError('Please provide email and password!'));

  const user = await User.findByEmail(email).select('+password');

  if (!user || !(await user.isCorrectPassword(password, user.password)))
    return next(new UnauthorizedError('Invalid credentials'));

  createAndSendToken(user, status.OK, res);
});
