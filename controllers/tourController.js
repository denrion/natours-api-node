import Tour from '../models/Tour.js';
import APIFeatures from '../utils/APIFeatures.js';
import ResponseStatus from '../utils/responseStatus.js';

// @desc      Get Top 5 Cheapest Tours
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
export const getAllTours = async (req, res, next) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      status: ResponseStatus.FAILURE,
      message: error,
    });
  }
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
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
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

// @desc      Get Tour Stats
// @route     GET /api/v1/tours/tour-stats
// @access    Public
export const getTourStats = async (req, res, next) => {
  try {
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

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: { stats },
    });
  } catch (error) {
    res.status(500).json({
      status: ResponseStatus.FAILURE,
      message: error,
    });
  }
};

// @desc      Get Montly Plan
// @route     GET /api/v1/tours/monthly-plan/:year
// @access    Public
export const getMontlyPlan = async (req, res, next) => {
  try {
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

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: { plan },
    });
  } catch (error) {
    res.status(500).json({
      status: ResponseStatus.FAILURE,
      message: error,
    });
  }
};
