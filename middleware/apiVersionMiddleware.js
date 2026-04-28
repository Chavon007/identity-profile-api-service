export const apiVersionMiddleware = (req, res, next) => {
  const version = req.headers["x-api-version"];

  if (!version) {
    return res.status(400).json({
      status: "error",
      message: "API version header (API version header) is required",
    });
  }

  const allowApiVersion = ["1"];

  if (!allowApiVersion.includes(version)) {
    return res.status(400).json({
      status: "error",
      message: `Unsupported API version: ${version}`,
    });
  }

  //   attcah the version
  req.apiVersion = version;
  next();
};
