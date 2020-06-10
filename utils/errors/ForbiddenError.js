import status from 'http-status';
import AppError from './AppError.js';

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, status.FORBIDDEN);
  }
}

export default ForbiddenError;
