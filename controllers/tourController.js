import status from 'http-status';
import Tour from '../models/Tour.js';
import catchAsync from '../utils/catchAsync.js';
import BadRequestError from '../utils/errors/BadRequestError.js';
import InternalServerError from '../utils/errors/InternalServerError.js';
import ResponseStatus from '../utils/responseStatus.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory.js';

// @desc      Get Top 5 Cheapest Tours - ALIAS
// @route     GET /api/v1/tours?sort=-ratingsAverage,price&limit=5
// @access    Public
// @usage     Use as middleware before getAllTours
export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// @desc      Get All Tours
// @route     GET /api/v1/tours
// @access    Public
export const getAllTours = getAll(Tour);

// @desc      Get Tour By Id
// @route     GET /api/v1/tours/:tourId
// @access    Public
export const getTour = getOne(Tour, { path: 'reviews' });

// @desc      Create New Tour
// @route     POST /api/v1/tours
// @access    Public
export const createTour = createOne(Tour);

// @desc      Update tour
// @route     PATHS /api/v1/tours/:tourId
// @access    Public
export const updateTour = updateOne(Tour);

// @desc      Delete tour
// @route     DELETE /api/v1/tours/:tourId
// @access    Private
export const deleteTour = deleteOne(Tour);

// @desc      Get Tour Stats
// @route     GET /api/v1/tours/tour-stats
// @access    Public
export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  if (!stats) return next(new InternalServerError('Something went wrong'));

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: { stats },
  });
});

// @desc      Get Montly Plan
// @route     GET /api/v1/tours/monthly-plan/:year
// @access    Public
export const getMontlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);

  if (!plan) return next(new InternalServerError('Something went wrong'));

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: { plan },
  });
});

// @desc      Get Tours Within Specified Distance
// @route     GET /api/v1/tours/tours-within/distance/:distance/center/:latlng/unit/:unit
// @access    Public
export const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new BadRequestError(
        'Please provide latitude and longitude in the format: lat,lng'
      )
    );

  const EARTH_RADIUS_MI = 3963.2;
  const EARTH_RADIUS_KM = 6378.1;
  const radius = distance / (unit === 'mi' ? EARTH_RADIUS_MI : EARTH_RADIUS_KM);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(status.OK).json({
    status: ResponseStatus.SUCCESS,
    results: tours.length,
    data: { tours },
  });
});

// @desc      Get Distances To Tours From Point
// @route     GET /api/v1/tours/distances/:latlng/unit/:unit
// @access    Public
export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new BadRequestError(
        'Please provide latitude and longitude in the format: lat,lng'
      )
    );

  const MULTIPLIER = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: MULTIPLIER,
      },
    },
    {
      $project: { distance: 1, name: 1 },
    },
  ]);

  res.status(status.OK).json({
    status: ResponseStatus.SUCCESS,
    data: { distances },
  });
});
