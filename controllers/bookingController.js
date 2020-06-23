import status from 'http-status';
import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import Tour from '../models/Tour.js';
import catchAsync from '../utils/catchAsync.js';
import NotFoundError from '../utils/errors/NotFoundError.js';
import ResponseStatus from '../utils/responseStatus.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory.js';

// @desc      Get Stripe Session
// @route     GET /api/v1/bookings/checkout-session/:tourId
// @access    Private
export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour)
    return next(new NotFoundError('No tour found with the specified id'));

  // will be changed after the site is deployed
  const temporarySuccessUrl = `${req.protocol}://${req.get('host')}/?tour=${
    req.params.tourId
  }&user=${req.user.id}&price=${tour.price}`;

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: temporarySuccessUrl,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3) Send session to client
  res.status(status.OK).json({
    status: ResponseStatus.SUCCESS,
    session,
  });
});

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is ony TEMPORARY, because it`s NOT SECURE becuase
  // everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

// @desc      Get All Bookings
// @route     GET /api/v1/bookings
// @access    Private
export const getAllBookings = getAll(Booking);

// @desc      Get Booking By Id
// @route     GET /api/v1/bookings/:bookingId
// @access    Private
export const getBooking = getOne(Booking);

// @desc      Create New Booking
// @route     POST /api/v1/bookings
// @access    Private
export const createBooking = createOne(Booking);

// @desc      Update Booking
// @route     PATHS /api/v1/bookings/:bookingId
// @access    Private
export const updateBooking = updateOne(Booking);

// @desc      Delete Booking
// @route     DELETE /api/v1/bookings/:bookingId
// @access    Private
export const deleteBooking = deleteOne(Booking);
