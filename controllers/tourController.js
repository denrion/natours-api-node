import Tour from '../models/Tour.js';
import APIFeatures from '../utils/APIFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import InternalServerError from '../utils/errors/InternalServerError.js';
import NotFoundError from '../utils/errors/NotFoundError.js';
import ResponseStatus from '../utils/responseStatus.js';

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
export const getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    results: tours.length,
    data: { tours },
  });
});

// @desc      Get Tour By Id
// @route     GET /api/v1/tours/:tourId
// @access    Public
export const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour)
    return next(new NotFoundError('No document found with the specified id'));

  res.status(200).json({ status: ResponseStatus.SUCCESS, data: { tour } });
});

// @desc      Create New Tour
// @route     POST /api/v1/tours
// @access    Public
export const createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);

  if (!tour)
    return next(
      new InternalServerError(
        'Error occured while creating a document. Please, try again.'
      )
    );

  res.status(201).json({ status: ResponseStatus.SUCCESS, data: { tour } });
});

// @desc      Update tour
// @route     PATHS /api/v1/tours/:tourId
// @access    Public
export const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour)
    return next(new NotFoundError('No document found with the specified id'));

  res.status(200).json({ status: ResponseStatus.SUCCESS, data: { tour } });
});

// @desc      Delete tour
// @route     DELETE /api/v1/tours/:tourId
// @access    Public
export const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour)
    return next(new NotFoundError('No document found with the specified id'));

  res.status(204).json({ status: ResponseStatus.SUCCESS, data: null });
});

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
