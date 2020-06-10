import status from 'http-status';
import AppError from './AppError.js';

class NotFoundError extends AppError {
  constructor(message) {
    super(message, status.NOT_FOUND);
  }
}

export default NotFoundError;
