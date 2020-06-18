/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './auth.js';
import displayMap from './mapbox';

// DOM ELEMENTS
const mapSection = document.getElementById('map');
const loginFrom = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');

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
