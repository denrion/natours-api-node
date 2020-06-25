import ResponseStatus from './responseStatus.js';

const createAndSendToken = (user, statusCode, req, res) => {
  const token = user.signToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // turn into milis
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // The second one is ONLY for Heroku
  };

  res.status(statusCode).cookie('jwt', token, cookieOptions).json({
    status: ResponseStatus.SUCCESS,
    data: { token, user },
  });
};

export default createAndSendToken;
