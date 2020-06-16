import status from 'http-status';
import APIFeatures from '../utils/APIFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import InternalServerError from '../utils/errors/InternalServerError.js';
import NotFoundError from '../utils/errors/NotFoundError.js';
import lowercaseFirstLetter from '../utils/helpers/lowercaseFirstLetter.js';
import setCorrectPluralSuffix from '../utils/helpers/setCorrectPluralSuffix.js';
import ResponseStatus from '../utils/responseStatus.js';

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const filter = res.locals.filter || {};

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const documents = await features.query;
    const totalResults = await Model.countDocuments();

    res.status(status.OK).json({
      status: ResponseStatus.SUCCESS,
      returnedResults: documents.length,
      totalResults,
      pagination: features.createPaginationLinks(totalResults),
      data: {
        [setCorrectPluralSuffix(
          lowercaseFirstLetter(Model.modelName)
        )]: documents,
      },
    });
  });

export const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;

    if (!document)
      return next(new NotFoundError('No document found with the specified id'));

    res.status(status.OK).json({
      status: ResponseStatus.SUCCESS,
      data: {
        [setCorrectPluralSuffix(
          lowercaseFirstLetter(Model.modelName)
        )]: document,
      },
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    if (!document)
      return next(
        new InternalServerError(
          'Error occured while creating a document. Please, try again.'
        )
      );

    res.status(status.CREATED).json({
      status: ResponseStatus.SUCCESS,
      data: {
        [setCorrectPluralSuffix(
          lowercaseFirstLetter(Model.modelName)
        )]: document,
      },
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document)
      return next(new NotFoundError('No document found with the specified id'));

    res.status(status.OK).json({
      status: ResponseStatus.SUCCESS,
      data: {
        [setCorrectPluralSuffix(
          lowercaseFirstLetter(Model.modelName)
        )]: document,
      },
    });
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document)
      return next(new NotFoundError('No document found with the specified id'));

    res
      .status(status.NO_CONTENT)
      .json({ status: ResponseStatus.SUCCESS, data: null });
  });
