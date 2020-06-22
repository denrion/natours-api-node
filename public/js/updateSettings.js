import API from 'axios';
import showAlert from './alerts.js';

// type is either password or data
export const updateSettings = async (data, type) => {
  const endpoint = type === 'password' ? 'updateMyPassword' : 'updateMe';
  const url = `/api/v1/auth/${endpoint}`;

  try {
    const res = await API.patch(url, data);
    if (res.data.status === 'success')
      showAlert('success', `${type.toUpperCase()} updated successfuly`);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
