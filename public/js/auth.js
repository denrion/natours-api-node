/* eslint-disable */
import showAlert from './alerts';
import API from './axios';

export const login = async (email, password) => {
  const url = '/api/v1/auth/login';
  const data = { email, password };
  const config = { withCredentials: true };

  try {
    const res = await API.post(url, data, config);
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      location.assign('/');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  console.log('here');

  const url = '/api/v1/auth/logout';
  const config = { withCredentials: true };

  try {
    const res = await API.get(url, null, config);
    if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    showAlert('error', 'Error loggoing out! Please, try again');
  }
};
