import fs from 'fs';
import path from 'path';
import ResponseStatus from '../utils/responseStatus.js';

const tours = JSON.parse(
  fs.readFileSync(path.resolve('dev-data', 'data', 'tours-simple.json'))
);

export const checkId = (req, res, next, val) => {
  const tour = tours.find((tour) => tour.id === +val);

  if (!tour)
    return res.status(404).json({
      status: ResponseStatus.FAILURE,
      message: 'No tour with specified id',
    });

  next();
};

export const getAllTours = (req, res, next) => {
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    results: tours.length,
    data: { tours },
  });
};

export const createTour = (req, res, next) => {
  const tour = req.body;

  res.status(201).json({ status: ResponseStatus.SUCCESS, data: { tour } });
};

export const getTour = (req, res, next) => {
  const tour = tours.find((tour) => tour.id === +req.params.id);
  res.status(200).json({ status: ResponseStatus.SUCCESS, data: { tour } });
};

export const updateTour = (req, res, next) => {
  const tour = tours.find((tour) => tour.id === +req.params.id);
  const updatedTour = { ...tour, ...req.body };

  res
    .status(200)
    .json({ status: ResponseStatus.SUCCESS, data: { updatedTour } });
};

export const deleteTour = (req, res, next) => {
  res.status(204).json({ status: ResponseStatus.SUCCESS, data: null });
};
