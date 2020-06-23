/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './auth';
import displayMap from './mapbox';
import { bookTour } from './stripe.js';
import { updateSettings } from './updateSettings.js';

// DOM ELEMENTS
const mapSection = document.getElementById('map');
const loginFrom = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataFormSubmitBtn = document.querySelector('.form-user-data .btn');
const userPasswordFormSubmitBtn = document.querySelector(
  '.form-user-password .btn'
);
const bookTourBtn = document.getElementById('book-tour');

// DELEGATION
if (mapSection) {
  const locations = JSON.parse(mapSection.dataset.locations);
  displayMap(locations);
}

if (loginFrom) {
  loginFrom.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataFormSubmitBtn) {
  userDataFormSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('photo').files[0];

    const form = new FormData();
    form.append('name', name);
    form.append('email', email);
    form.append('photo', photo);

    updateSettings(form, 'data');
  });
}

if (userPasswordFormSubmitBtn) {
  userPasswordFormSubmitBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    userPasswordFormSubmitBtn.textContent = 'Updating...';

    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { oldPassword, newPassword, passwordConfirm },
      'password'
    );

    userPasswordFormSubmitBtn.textContent = 'Save Password'.toUpperCase();

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', async (e) => {
    bookTourBtn.textContent = 'Processing...';

    const { tourId } = e.target.dataset;
    await bookTour(tourId);

    bookTourBtn.textContent = 'Book Tour Now!';
  });
}
