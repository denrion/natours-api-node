import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      uniqueCaseInsensitive: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      match: [
        /^[a-zA-Z0-9]+(?:[_-]?[a-zA-Z0-9])*$/,
        'Password can only contain letters, numbers, underscores and dashes',
      ],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please provide a password confirmation'],
      minlength: 8,
      match: [
        /^[a-zA-Z0-9]+(?:[_-]?[a-zA-Z0-9])*$/,
        'Password can only contain letters, numbers, underscores and dashes',
      ],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ************************ VIRTUALS ************************ //

// ******************* DOCUMENT MIDDLEWARE ****************** //
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Don't store passwordConfirm field in DB
  this.passwordConfirm = undefined;

  next();
});

// userSchema.pre('save', function (next) {
//   if (!this.isModified('password') || this.isNew) return next();

//   this.passwordChangedAt = Date.now() - 1000;

//   next();
// });
// ******************** QUERY MIDDLEWARE ******************* //

// **************** AGGREGATION MIDDLEWARE **************** //

// ******************* INSTANT METHONDS ******************* //
userSchema.methods.signToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

userSchema.methods.isCorrectPassword = async (
  candidatePassword,
  userPassword
) => await bcrypt.compare(candidatePassword, userPassword);

// ******************** STATIC METHODS ******************** //
userSchema.static('findByEmail', function (email) {
  return this.findOne({ email });
});

// ************************ PLUGINS *********************** //
userSchema.plugin(uniqueValidator, {
  message: 'User with {PATH}:{VALUE} already exists. Please use another value.',
});

const User = mongoose.model('User', userSchema);

export default User;
