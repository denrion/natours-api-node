const setBodyFieldFromParam = (fieldName = '', paramName = '') => (
  req,
  res,
  next
) => {
  if (!req.body[fieldName]) req.body[fieldName] = req.params[paramName];
  next();
};

export default setBodyFieldFromParam;
