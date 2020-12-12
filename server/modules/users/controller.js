import User from "./model";
import message from "./message";
import { userService } from "./service";
import catchAsync from "../../utils/catchAsync";
import { smsService } from "../../services/sms";
import { emailService } from "../../services/email";
import { authService } from "./auth";
import moment from "moment";
export const UserController = {
  register: catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    if (newUser) {
      const otp = authService.generateOtp(6);
      await User.updateOne(
        { _id: newUser.id },
        { otp: { code: otp, expireTime: moment().add(6, "minutes") } }
      ).exec();
      authService.createSendToken({ ...newUser._doc, otp: otp }, 200, req, res);
    }
  }),
  socialAuth: catchAsync(async (req, res, next) => {
    let params = req.body;
    if (!params || (!params.facebookAuthId && !params.googleAuthId)) {
      res.badRequest({}, message.BAD_REQUEST);
    }
    let response = await userService.socialAuth({ profile: params });
    if (response.flag) {
      if (response.register && response.user && _.size(response.user.emails)) {
        let primaryEmail = userService.getPrimaryEmail(response.user.emails);
        await userService.createCustomer(primaryEmail);
        res.ok({}, message.OK);
      }
    } else {
      res.serverError({}, response.message);
    }
  }),
  login: catchAsync(async (req, res, next) => {
    const { username, password } = req.body;
    let user = await User.findOne({
      $or: [{ mobileNumber: username }],
    }).exec();
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.badRequest({}, message.INVALID_PASSWORD);
    }
    if (!user.mobileNumberVerified) {
      return res.badRequest({}, message.MOBILE_NUMBER_NOT_VERIFIED);
    }
    delete user.otp;
    authService.createSendToken(user, 201, req, res);
  }),
  sendOtp: catchAsync(async (req, res, next) => {
    let user = await User.findOne({
      $or: [{ mobileNumber: req.body.mobile }],
    }).exec();
    if (!user) {
      res.serverError({}, message.USER_LIST_NOT_FOUND);
    }
    const otp = authService.generateOtp(6);
    // let smsObj = {
    //     message: "Your One Time Password for login is " + otp,
    //     mobiles: req.body.mobile,
    //   };
    //   smsService.send(smsObj);
    await User.updateOne(
      { _id: user._id },
      { otp: { code: otp, expireTime: moment().add(6, "minutes") } }
    ).exec();

    res.ok({ otp: otp }, message.OK);
  }),
  validateOtp: catchAsync(async (req, res, next) => {
    const params = req.body;
    if (!params || !params.code || !params.id) {
      res.badRequest({}, message.BAD_REQUEST);
    }
    let user = await User.findOne({
      "otp.code": params.code,
      _id: params.id,
    }).exec();
    if (user && user.otp.expireTime) {
      if (moment().isAfter(moment(user.otp.expireTime))) {
        //code expire
        res.serverError({}, message.OTP_EXPIRE);
      } else {
        await User.updateOne(
          { _id: params.id },
          { $set: { mobileNumberVerified: true, otp: {} } }
        );
        res.ok({}, message.LOGIN);
      }
      // authService.createSendToken(user, 201, req, res);
    } else {
      //invalid code
      res.badRequest({}, message.INVALID_OTP);
    }
  }),
  forgotPassword: catchAsync(async (req, res, next) => {
    let user = await User.findOne({
      $or: [{ mobileNumber: req.body.mobile }],
    }).exec();
    if (!user) {
      res.serverError({}, message.USER_LIST_NOT_FOUND);
    }
    const otp = authService.generateOtp(6);
    // let smsObj = {
    //     message: "Your One Time Password for login is " + otp,
    //     mobiles: req.body.mobile,
    //   };
    //   smsService.send(smsObj);
    await User.updateOne(
      { _id: user._id },
      { resetPassword: { code: otp, expireTime: moment().add(6, "minutes") } }
    ).exec();

    res.ok({ otp: otp }, message.OK);
  }),
  resetPassword: catchAsync(async (req, res, next) => {
    const params = req.body;
    if (!params || !params.code || !params.newPassword || !params.mobile) {
      res.badRequest({}, message.BAD_REQUEST);
    }
    let user = await User.findOne({
      "resetPassword.code": params.code,
      mobileNumber: params.mobile,
    }).exec();
    if (user && user.resetPassword.expireTime) {
      if (moment().isAfter(moment(user.resetPassword.expireTime))) {
        //code expire
        return res.serverError({}, message.OTP_EXPIRE);
      } else {
        await userService.resetUserPassword(user, params.newPassword);
        return res.ok({}, message.USER_PASSWORD_RESET);
      }
    } else {
      return res.badRequest({}, message.INVALID_OTP);
    }
  }),
  passwordUpdateByUser: catchAsync(async (req, res, next) => {
    const params = req.body;
    if (!params || !params.newPassword || !params.currentPassword) {
      res.badRequest({}, message.BAD_REQUEST);
    }
    console.log(params.id);
    let user = await User.findById(params.id).exec();
    console.log(params.currentPassword);
    console.log(user);
    let response = await userService.resetUserPassword(
      user,
      params.newPassword,
      params.currentPassword
    );

    if (response && response.flag) {
      res.ok({}, response.message);
    } else {
      res.badRequest({}, message.CURRENT_PASSWORD_WRONG);
    }
  }),
  notificationIdentifierUpsert: catchAsync(async (req, res, next) => {
    let playerId = req.headers.playerid;
    let deviceType = req.headers.devicetype;
    let loginUser = req.user;
    console.log("loginUser", loginUser);
    if (!playerId || !deviceType) {
      res.badRequest({}, message.BAD_REQUEST);
    }
    let response = await userService.notificationIdentifierUpsert({
      playerId,
      deviceType,
      loginUser,
    });
    if (response) {
      res.ok({}, response);
    } else {
      res.serverError(null, message.SERVER_ERROR);
    }
  }),
  userList: catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.ok(users, message.OK);
  }),
};
