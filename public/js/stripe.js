/* eslint-disable */
import showAlert from './alerts.js';
import API from './axios';

const STRIPE_PUBLIC_KEY =
  'pk_test_51Gx7jtLEXheXGSvBny8KxsSWPwwoIs9Y0Qs3N7wliuL3pRNuMmUCU5l3qDKFSo7kvLOiWfGMFiXrVLvefQRzjMi700ppXFkonb';

const stripe = Stripe(STRIPE_PUBLIC_KEY);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const response = await API.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({ sessionId: response.data.session.id });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
