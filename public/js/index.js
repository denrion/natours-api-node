/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './auth';
import displayMap from './mapbox';
import { updateData } from './updateSettings.js';

// DOM ELEMENTS
const mapSection = document.getElementById('map');
const loginFrom = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataFormSubmitBtn = document.querySelector('.form-user-data .btn');

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

    updateData(name, email);
  });
}
