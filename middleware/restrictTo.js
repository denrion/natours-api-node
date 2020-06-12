import ForbiddenError from '../utils/errors/ForbiddenError.js';

const restictTo = (...roles) => (req, res, next) => {
  return !roles.includes(req.user.role)
    ? next(
        new ForbiddenError('You do not have permission to perform this action')
      )
    : next();
};

export default restictTo;
