import { Auth } from "../middleware/auth";
export const restifyOptions = {
  totalCountHeader:true,
  preMiddleware: Auth.protect,
  preCreate: (req, res, next) => {
    req.body.createdBy = req.user._id;
    req.body.updatedBy = req.user._id;
    next();
  },
  preUpdate: (req, res, next) => {
    req.body.updatedBy = req.user._id;
    next();
  },
  outputFn(req, res) {
    const result = req.erm.result; // filtered object
    res.ok(result, "Success");
  },
};
export default restifyOptions;
