import status from 'http-status';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import ResponseStatus from '../utils/responseStatus.js';

// @desc      Signup user
// @route     POST /api/v1/auth/signup
// @access    Public
export const singup = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  const { role, ...user } = req.body;

  const newUser = await User.create(user);

  res.status(status.CREATED).json({
    status: ResponseStatus.SUCCESS,
    data: { user: newUser },
  });
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
// export const login = catchAsync(async (req, res, next) => {
//   res.status(status.OK).json({
//     status: ResponseStatus.SUCCESS,
//     data: {},
//   });
// });
