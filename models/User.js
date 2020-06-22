import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import {
  sanitizeMongoFields,
  sanitizeSpecifiedFields,
} from '../utils/sanitizeModel.js';

export const Role = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
  GUIDE: 'guide',
  LEAD_GUIDE: 'lead-guide',
});

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
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
      // FIND A WAY TO CHECK ONLY IF EMAIL CHANGED
      // validate: {
      //   // eslint-disable-next-line no-use-before-define
      //   validator: async (val) => {
      //     console.log(val);
      //     return !(await User.findByEmail(val));
      //   },
      //   message:
      //     'User with {PATH}: {VALUE} already exists. Please use another value.',
      // },
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
      required: true,
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: { type: Boolean, default: true, select: false },
  },
  {
    timestamps: true,
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

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Add -1000, because saving to DB is sometimes slower than sending JWT
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// ******************** QUERY MIDDLEWARE ******************* //
userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

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

// Check if password was changed after the JWT token was sent
userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = +this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < new Date(changedTimestamp);
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// ******************** STATIC METHODS ******************** //
userSchema.static('findByEmail', function (email) {
  return this.findOne({ email });
});

// ************************ PLUGINS *********************** //

userSchema.plugin(sanitizeMongoFields);
userSchema.plugin(sanitizeSpecifiedFields, [
  'password',
  'passwordConfirm',
  'passwordChangedAt',
  'passwordResetToken',
  'passwordResetExpires',
  'isActive',
]);

const User = mongoose.model('User', userSchema);

export default User;
