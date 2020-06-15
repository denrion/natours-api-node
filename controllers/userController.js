/* eslint-disable no-unused-vars */
import status from 'http-status';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import filterReqBody from '../utils/filterReqBody.js';
import ResponseStatus from '../utils/responseStatus.js';

// @desc      Update currently logged in user
// @route     PATCH /api/v1/users/updateMe
// @access    Private
export const updateMe = catchAsync(async (req, res, next) => {
  // Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filterReqBody(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(status.OK).json({
    status: ResponseStatus.SUCCESS,
    data: { updatedUser },
  });
});

// @desc      "Delete" currently logged in user
// @route     PATCH /api/v1/users/deleteMe
// @access    Private
export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { isActive: false },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(status.NO_CONTENT).json({
    status: ResponseStatus.SUCCESS,
    data: null,
  });
});

export const getAllUsers = async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: { users },
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
