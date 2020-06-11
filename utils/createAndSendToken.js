import ResponseStatus from './responseStatus.js';

const createAndSendToken = (user, statusCode, res) => {
  const token = user.signToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // turn into milis
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.status(statusCode).cookie('jwt', token, cookieOptions).json({
    status: ResponseStatus.SUCCESS,
    data: { token, user },
  });
};

export default createAndSendToken;
