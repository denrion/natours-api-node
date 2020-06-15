/* eslint-disable no-unused-vars */
import status from 'http-status';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import filterReqBody from '../utils/filterReqBody.js';
import ResponseStatus from '../utils/responseStatus.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory.js';

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

// @desc      Get All Users
// @route     GET /api/v1/users
// @access    Private
export const getAllUsers = getAll(User);

// @desc      Get User By Id
// @route     GET /api/v1/users/:userId
// @access    Private
export const getUser = getOne(User);

// @desc      Create New User
// @route     POST /api/v1/users
// @access    Private
export const createUser = createOne(User);

// @desc      Update user
// @route     PATHS /api/v1/users/:userId
// @access    Private
export const updateUser = updateOne(User);

// @desc      Delete User
// @route     DELETE /api/v1/users/:userId
// @access    Private
export const deleteUser = deleteOne(User);
