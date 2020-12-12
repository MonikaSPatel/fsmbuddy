import message from "./message";

export default function (req, res, next) {
  res.ok = function (data, message) {
    const response = _.assign({
      code: "OK",
      message: message || "Operation successfully executed.",
      data: data || {},
    });
    res.status(200);
    res.json(response);
  };
  res.badRequest = function (data, message) {
    const response = {
      code: "E_BAD_REQUEST",
      message: message,
      data: data || {},
    };
    res.status(400);
    res.json(response);
  };
  res.serverError = function (data, message) {
    const response = {
      code: "E_SERVER_ERROR",
      message: message.SERVER_ERROR,
      data: data || {},
    };
    res.status(500);
    res.json(response);
  };
  next();
}
