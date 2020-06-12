import crypto from 'crypto';
import status from 'http-status';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import createAndSendToken from '../utils/createAndSendToken.js';
import sendEmail from '../utils/email/sendEmail.js';
import BadRequestError from '../utils/errors/BadRequestError.js';
import InternalServerError from '../utils/errors/InternalServerError.js';
import UnauthorizedError from '../utils/errors/UnauthorizedError.js';
import ResponseStatus from '../utils/responseStatus.js';

// @desc      Signup user
// @route     POST /api/v1/auth/signup
// @access    Public
export const singup = catchAsync(async (req, res, next) => {
  // Prevent chaning the default user role on signup
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

// @desc      Get Current Logged In user
// @route     GET /api/v1/auth/me
// @access    Private
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(status.OK).json({
    success: ResponseStatus.SUCCESS,
    data: { user },
  });
});

// @desc      Forgot Password
// @route     POST /api/v1/auth/forgotPassword
// @access    Public
export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on POSTed email
  const { email } = req.body;
  const user = await User.findByEmail(email);

  if (!user)
    return next(new BadRequestError('User with provided email does not exist'));

  // 2a) generate a random token
  const resetToken = user.createPasswordResetToken();

  // 2b) update user data in DB
  await user.save({ validateBeforeSave: false });

  // 3) send it back as an email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email,
      subject: 'Password Reset Token (valid for 10 minutes)',
      message,
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new InternalServerError(
        'There was an error sending an email. Try again later!'
      )
    );
  }

  res.status(status.OK).json({
    status: ResponseStatus.SUCCESS,
    message: 'Token sent to email',
  });
});

// @desc      Reset Password
// @route     PATCH /api/v1/auth/resetPassword/:token
// @access    Public
export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  // 2) If token valid && user exists -> set new password
  if (!user)
    return next(new BadRequestError('Token is invalid or has expired'));

  const { password, passwordConfirm } = req.body;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in, send JWT to client
  createAndSendToken(user, status.OK, res);
});

// @desc      Update Password of currently logged in user
// @route     PATCH /api/v1/auth/updateMyPassword
// @access    Private
export const updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) Get user from DB by ID from req.user object set by isAuth middleware
  const user = await User.findById(req.user.id).select('+password');

  // 2a) Check if sent current password is correct
  const { oldPassword, newPassword, passwordConfirm } = req.body;

  if (!user || !(await user.isCorrectPassword(oldPassword, user.password)))
    return next(new UnauthorizedError('Invalid password'));

  // 2b) Check if new password is not the same as old password
  if (newPassword === oldPassword)
    return next(
      new BadRequestError('New password cannot be the same as old password')
    );

  // 3) if so, update password
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createAndSendToken(user, status.OK, res);
});
