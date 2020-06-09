import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    uniqueCaseInsensitive: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

tourSchema.plugin(uniqueValidator, {
  message: 'Tour with {PATH}:{VALUE} already exists. Please try again',
});

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;
