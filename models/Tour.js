import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import slugify from 'slugify';
import {
  sanitizeMongoFields,
  sanitizeSpecifiedFields,
} from '../utils/sanitizeModel.js';

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'Point',
    enum: ['Point'],
  },
  coordinates: [Number],
  address: String,
  description: String,
  day: Number,
});

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      trim: true,
      unique: true,
      uniqueCaseInsensitive: true,
      maxlength: [40, 'A tour must have fewer than or equal to 40 characters'],
      minlength: [10, 'A tour must have more than or equal to 40 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty must be one of the following: easy, medium, diffcult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating must be greater than 1.0'],
      max: [5, 'A rating must be lower than 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // this only points to current doc on NEW document creation
        // validator won't work for updates
        validator: function (val) {
          return val < this.price;
        },
        message:
          'Discount price ({VALUE}) should be lower than the regular price',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: locationSchema,
    locations: [locationSchema],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

// ************************ VIRTUALS ************************ //
tourSchema.virtual('durationWeeks').get(function () {
  return Math.ceil(this.duration / 7);
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});

// ******************* DOCUMENT MIDDLEWARE ****************** //
// Runs before .save() and .create(), not insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// ******************** QUERY MIDDLEWARE ******************* //
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate('guides');
  next();
});

// **************** AGGREGATION MIDDLEWARE **************** //
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// ******************* INSTANT METHONDS ******************* //

// ******************** STATIC METHODS ******************** //

// ************************ PLUGINS *********************** //
tourSchema.plugin(uniqueValidator, {
  message: 'Tour with {PATH}:{VALUE} already exists. Please use another value.',
});

tourSchema.plugin(sanitizeMongoFields);
tourSchema.plugin(sanitizeSpecifiedFields, ['secretTour']);

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;
