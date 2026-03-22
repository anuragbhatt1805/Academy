export const cookieParser = (req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      req.cookies[parts.shift().trim()] = decodeURIComponent(parts.join("="));
    });
  }
  next();
};
