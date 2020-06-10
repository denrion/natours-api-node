import status from 'http-status';
import AppError from './AppError.js';

class InternalServerError extends AppError {
  constructor(message) {
    super(message, status.INTERNAL_SERVER_ERROR);
  }
}

export default InternalServerError;
