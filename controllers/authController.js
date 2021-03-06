import crypto from 'crypto';
import status from 'http-status';
import multer from 'multer';
import sharp from 'sharp';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import createAndSendToken from '../utils/createAndSendToken.js';
import { default as Email } from '../utils/email/sendEmail.js';
import BadRequestError from '../utils/errors/BadRequestError.js';
import InternalServerError from '../utils/errors/InternalServerError.js';
import UnauthorizedError from '../utils/errors/UnauthorizedError.js';
import filterReqBody from '../utils/filterReqBody.js';
import ResponseStatus from '../utils/responseStatus.js';

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    cb(new BadRequestError('Not an image! Please upload only images'), false);
  }

  cb(null, true);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// @desc      Signup user
// @route     POST /api/v1/auth/signup
// @access    Public
export const signup = catchAsync(async (req, res, next) => {
  // Prevent chaning the default user role on signup
  // eslint-disable-next-line no-unused-vars
  const { role, photo, ...signupData } = req.body;

  const user = await User.create(signupData);

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(user, url).sendWelcome();

  createAndSendToken(user, status.CREATED, req, res);
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

  createAndSendToken(user, status.OK, req, res);
});

// @desc      Logout user
// @route     GET /api/v1/auth/logout
// @access    Private
// @usage     Use to "delete" the jwt cookie if using cookies for storing jwt
export const logout = catchAsync(async (req, res, next) => {
  res
    .status(status.OK)
    .cookie('jwt', 'Logged Out', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .json({ status: ResponseStatus.SUCCESS });
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
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetPassword/${resetToken}`;

    new Email(user, resetURL).sendPasswordReset();

    res.status(status.OK).json({
      status: ResponseStatus.SUCCESS,
      message: 'Token sent to email',
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
  createAndSendToken(user, status.OK, req, res);
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

// @desc      Update currently logged in user
// @route     PATCH /api/v1/auth/updateMe
// @access    Private
export const updateMe = catchAsync(async (req, res, next) => {
  // Only allow update for specified fields
  const filteredBody = filterReqBody(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(status.OK).json({
    status: ResponseStatus.SUCCESS,
    data: { updatedUser },
  });
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
  createAndSendToken(user, status.OK, req, res);
});

// @desc      "Delete" currently logged in user
// @route     PATCH /api/v1/auth/deleteMe
// @access    Private
export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { isActive: false },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(status.NO_CONTENT).json({
    status: ResponseStatus.SUCCESS,
    data: null,
  });
});
