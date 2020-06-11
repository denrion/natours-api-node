const getTokenFromAuthHeader = (req) => {
  return req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : undefined;
};

export default getTokenFromAuthHeader;
