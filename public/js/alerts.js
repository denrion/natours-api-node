/* eslint-disable */

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.remove();
};

// type is "success" or "error"
const showAlert = (type, msg) => {
  hideAlert();

  const alertEl = document.createElement('div');
  alertEl.textContent = msg;
  alertEl.className = `alert alert--${type}`;

  const body = document.querySelector('body');
  body.prepend(alertEl);

  window.setTimeout(hideAlert, 5000);
};

export default showAlert;
