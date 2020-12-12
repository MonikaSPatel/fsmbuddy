import User from "../modules/users/model";
import catchAsync from "../utils/catchAsync";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import config from "../config/config.json";
import message from "./message.js";

export const Auth = {
  protect: catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.badRequest({}, message.Auth.LOGIN_FAILED);
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, config.SECRET_KEY);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.badRequest({}, message.Auth.TOKEN_EXPIRED);
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
     return res.badRequest({}, message.Auth.PASSWORD_CHANGED_AFTER_TOKEN);
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  })
};
