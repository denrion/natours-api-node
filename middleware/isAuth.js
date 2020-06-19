import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import UnauthorizedError from '../utils/errors/UnauthorizedError.js';

const getTokenFromAuthHeader = (req) => {
  return req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : undefined;
};

const getTokenFromCookie = (req) => req.cookies.jwt;

const isAuth = catchAsync(async (req, res, next) => {
  const token = getTokenFromAuthHeader(req) || getTokenFromCookie(req);

  if (!token)
    return next(
      new UnauthorizedError('Not authenticated. Please log in to get access')
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(
      new UnauthorizedError(
        'The user, to whom this token belongs, no longer exists.'
      )
    );

  // Check if user changed password after the token was issued
  if (currentUser.isPasswordChangedAfter(decoded.iat))
    return next(
      new UnauthorizedError(
        'The password was recently changed! Please log in again.'
      )
    );

  // place current user on the request object
  req.user = currentUser;

  // Only for rendered pages
  res.locals.user = currentUser;

  // GRANT ACCESS TO THE PROTECTED ROUTE
  next();
});

// Only for rendered pages, no errors!
export const isLoggedIn = catchAsync(async (req, res, next) => {
  const token = getTokenFromCookie(req);

  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);

      if (!currentUser) return next();

      // Check if user changed password after the token was issued
      if (currentUser.isPasswordChangedAfter(decoded.iat)) return next();

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;

      return next();
    } catch (error) {
      return next();
    }
  }

  next();
});

export default isAuth;
