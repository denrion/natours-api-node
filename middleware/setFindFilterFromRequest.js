export const FILTER_TYPE = Object.freeze({
  REQ_PARAMS: 'params',
  REQ_USER: 'user',
});

const setFindFilterFromRequest = (
  fieldToSet = '',
  reqField = FILTER_TYPE.REQ_PARAMS,
  key = ''
) => (req, res, next) => {
  const value = req[reqField][key];
  res.locals.filter = value ? { [fieldToSet]: value } : {};

  next();
};

export default setFindFilterFromRequest;
