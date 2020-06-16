const setBodyFieldFromAuthUser = (fieldName = '') => (req, res, next) => {
  if (!req.body[fieldName]) req.body[fieldName] = req.user.id;
  next();
};

export default setBodyFieldFromAuthUser;
