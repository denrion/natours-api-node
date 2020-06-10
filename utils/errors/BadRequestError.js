import status from 'http-status';
import AppError from './AppError.js';

class BadRequestError extends AppError {
  constructor(message) {
    super(message, status.BAD_REQUEST);
  }
}

export default BadRequestError;
