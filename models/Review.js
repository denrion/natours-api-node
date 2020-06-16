import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import NotFoundError from '../utils/errors/NotFoundError.js';
import { sanitizeMongoFields } from '../utils/sanitizeModel.js';
import Tour from './Tour.js';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review cannot be empty'],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// ************************ VIRTUALS ************************ //

// ******************* DOCUMENT MIDDLEWARE ****************** //

// Recalculate averageRating on CREATE
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

// ******************** QUERY MIDDLEWARE ******************* //
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// Recalculate averageRating on findOneAndUpdate/Delete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  if (!this.r)
    return next(new NotFoundError('No document found with the specified id'));

  next();
});

// Use this in conjuction with the funcion above to
// preform calcAverageRatings on update & delete
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here becase the query was already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

// **************** AGGREGATION MIDDLEWARE **************** //

// ******************* INSTANT METHONDS ******************* //

// ******************** STATIC METHODS ******************** //
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const isStats = !!stats || stats.length > 0;
  const numRatings = isStats ? stats[0].numRatings : 0;
  const avgRating = isStats ? stats[0].avgRating : 4.5;

  await Tour.findByIdAndUpdate(
    tourId,
    {
      ratingsQuantity: numRatings,
      ratingsAverage: avgRating,
    },
    { runValidators: true, context: 'query' }
  );
};
// ************************ PLUGINS *********************** //

reviewSchema.plugin(uniqueValidator, {
  message: 'This user has already reviewed this tour',
});

reviewSchema.plugin(sanitizeMongoFields);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
