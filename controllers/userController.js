/* eslint-disable no-unused-vars */
import status from 'http-status';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import ResponseStatus from '../utils/responseStatus.js';

// @desc      Update currently logged in user
// @route     PATCH /api/v1/users/updateMe
// @access    Private
export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Prevent updating deconstructed variables
  const {
    _id,
    __v,
    password,
    passwordConfirm,
    passwordChangedAt,
    passwordResetToken,
    passwordResetExpires,
    createdAt,
    updatedAt,
    role,
    ...updateData
  } = req.body;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(status.OK).json({
    status: ResponseStatus.SUCCESS,
    data: { updatedUser },
  });
});

export const getAllUsers = (req, res, next) => {
  res.status(500).json({
    status: ResponseStatus.FAILURE,
    message: 'Route not yet implemented',
  });
};

export const createUser = (req, res, next) => {
  res.status(500).json({
    status: ResponseStatus.FAILURE,
    message: 'Route not yet implemented',
  });
};

export const getUser = (req, res, next) => {
  res.status(500).json({
    status: ResponseStatus.FAILURE,
    message: 'Route not yet implemented',
  });
};

export const updateUser = (req, res, next) => {
  res.status(500).json({
    status: ResponseStatus.FAILURE,
    message: 'Route not yet implemented',
  });
};

export const deleteUser = (req, res, next) => {
  res.status(500).json({
    status: ResponseStatus.FAILURE,
    message: 'Route not yet implemented',
  });
};
