import status from 'http-status';
import AppError from './AppError.js';

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, status.UNAUTHORIZED);
  }
}

export default UnauthorizedError;
