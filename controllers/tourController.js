import Tour from '../models/Tour.js';
import ResponseStatus from '../utils/responseStatus.js';

// @desc      Get All Tours
// @route     GET /api/v1/tours
// @access    Public
export const getAllTours = async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    results: tours.length,
    data: { tours },
  });
};

// @desc      Get Tour By Id
// @route     GET /api/v1/tours/:tourId
// @access    Public
export const getTour = async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // if (!tour) return next(new Error('No document found with the specified id'));
  res.status(200).json({ status: ResponseStatus.SUCCESS, data: { tour } });
};

// @desc      Create New Tour
// @route     POST /api/v1/tours
// @access    Public
export const createTour = async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(201).json({ status: ResponseStatus.SUCCESS, data: { tour } });
};

// @desc      Update tour
// @route     PATHS /api/v1/tours/:tourId
// @access    Public
export const updateTour = async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body);
  // if (!tour) return next(new Error('No document found with the specified id'));
  res.status(200).json({ status: ResponseStatus.SUCCESS, data: { tour } });
};

// @desc      Delete tour
// @route     DELETE /api/v1/tours/:tourId
// @access    Public
export const deleteTour = async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  // if (!tour) return next(new Error('No document found with the specified id'));
  res.status(204).json({ status: ResponseStatus.SUCCESS, data: null });
};
