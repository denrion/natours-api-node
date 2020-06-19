import API from 'axios';
import showAlert from './alerts.js';

export const updateData = async (name, email) => {
  const url = '/api/v1/auth/updateMe';
  const data = { name, email };

  try {
    const res = await API.patch(url, data);
    if (res.data.status === 'success')
      showAlert('success', 'Data updated successfuly');
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
