export default (err, req, res, next) => {
  console.log(err);
  if (err.errors) {
    let errorBag = [];
    Object.keys(err.errors).forEach((fieldName) => {
      errorBag.push({ [fieldName]: err.errors[fieldName].message });
    });
    res.badRequest(errorBag, "Mongo validation error");
  } else {
    res.badRequest(err.errmsg, "Mongo validation error");
  }
};
