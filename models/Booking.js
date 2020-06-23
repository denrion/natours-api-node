import mongoose from 'mongoose';
import { sanitizeMongoFields } from '../utils/sanitizeModel.js';

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A booking must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A booking must belong to a user'],
    },
    price: {
      type: Number,
      required: [true, 'A booking must have a price'],
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

// ************************ VIRTUALS ************************ //

// ******************* DOCUMENT MIDDLEWARE ****************** //

// ******************** QUERY MIDDLEWARE ******************* //
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name' });
  next();
});

// **************** AGGREGATION MIDDLEWARE **************** //

// ******************* INSTANT METHONDS ******************* //

// ******************** STATIC METHODS ******************** //

// ************************ PLUGINS *********************** //

bookingSchema.plugin(sanitizeMongoFields);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
