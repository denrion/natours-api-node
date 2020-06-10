import status from 'http-status';
import AppError from './AppError.js';

class NotImplementedError extends AppError {
  constructor(message) {
    super(message, status.NOT_IMPLEMENTED);
  }
}

export default NotImplementedError;
