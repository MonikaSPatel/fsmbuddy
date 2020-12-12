import passport from "passport";
import jwt from "jsonwebtoken";
import User from "./model";
import { passportAuth } from "./passport";
import config from "../../config/config.json";
import message from "./message";

export const authService = {
  createSendToken(user, statusCode, req, res) {
    const token = authService.signToken(user._id);
    let result = {};
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + config.EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    });

    // Remove password from output
    user.password = undefined;
    result.token = token;
    result.user = user;
    res.ok(result, message.OK);
  },
  signToken(id) {
    return jwt.sign({ id }, config.SECRET_KEY, {
      expiresIn: config.EXPIRES_IN * 24 * 60 * 60 * 1000,
    });
  },
  generateOtp(length) {
    let numbers = "01234567890123456789";
    let result = "";
    for (let i = length; i > 0; --i) {
      result += numbers[Math.round(Math.random() * (numbers.length - 1))];
    }
    return result;
  },
  /**
   * @description validate required parameter(s)
   * @param params
   * @return {boolean}
   */
  async validateCheckOtpParams(params) {
    let isValid = false;
    if (params && params.code && params.id) {
      isValid = true;
    }
    return isValid;
  },
  /**
   * @description validate required parameter(s)
   * @param params
   * @return {boolean}
   */
  async validateForgotPasswordParams(params) {
    let isValid = false;
    if (
      params &&
      // && params.code
      params.email
    ) {
      isValid = true;
    }
    return isValid;
  },
  /**
   * create user
   * @param option
   * @returns {Promise.<*>}
   */
  async register(option) {
    try {
      // todo:- check pre-condition for user register
      let user = await User.create(option.params).fetch();
      return user;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  /**
   * check duplicate key
   * @param params
   * @param key
   * @returns {Promise.<boolean>}
   */
  async checkDuplication(params, key) {
    try {
      let filter = { where: {} };
      filter.where[key] = params[key];
      if (params.id) {
        filter.where.id = { "!=": params.id };
      }
      console.log(filter);
      let user = await User.findOne(filter.where);
      if (user) return true;
      else return false;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   *  check required params for register
   * @param params
   * @returns {Promise.<void>}
   */
  async requiredParamsForRegister(params) {
    let isValid = false;
    if (
      params &&
      params.firstName &&
      params.type &&
      params.email &&
      params.password &&
      params.mobile
    ) {
      isValid = true;
    }
    return isValid;
  },

  /**
   *  check required params for delete
   * @param params
   * @returns {Promise.<void>}
   */
  async requiredParamsForDestroy(params) {
    let isValid = false;
    if (params && params.ids) {
      isValid = true;
    }
    return isValid;
  },

  /**
   * @description validate required parameter(s)
   * @param params
   * @return {boolean}
   */
  async validateResetPasswordParams(params, body) {
    let isValid = false;
    if (
      params &&
      body &&
      // && params.code
      params.token &&
      body.newPassword
    ) {
      isValid = true;
    }
    return isValid;
  },

  /**
   *  process to login
   * @param req
   * @param res
   */
  async login(req, res) {
    passport.authenticate(
      "local",
      _.partial(passportAuth.onPassportAuth, req, res)
    )(req, res);
  },

  /**
   * check token
   * @param req
   * @param res
   * @returns {Request|*}
   */
  async isvalidtoken(req, res) {
    if (req.headers.authorization) {
      passport.authenticate("jwt", async (error, user, info) => {
        console.log(error);
        if (info && info.name === "TokenExpiredError") {
          info.status = 401;
        }
        if (info && info.name === "JsonWebTokenError") {
          info.status = 401;
        }
        if (error || !user) {
          return res.tokenExpire(error || info);
        }
        // req.options.values.conference_id = req.param('conference_id') || req.param('conference') || req.headers['conference_id'] || ''

        return res.ok(null, sails.config.message.OK);
      })(req, res);
    } else {
      return res.badRequest(null, sails.config.message.INVALID_TOKEN);
    }
  },

  /**
   * logout user
   * @param req
   */
  async logout(req) {
    try {
      await User.update({ id: req.body.id }, { loggedIn: false });
      req.logout();
      // req.session.destroy();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  /**
   * check otp of user
   * @param option
   * @returns {Promise.<void>}
   */
  async checkOtp(option) {
    let user = await User.findOne({
      id: option.id,
      verificationCode: option.code,
    });
    return user;
  },
  async removePlayerIdForExpiredToken(req) {
    let playerId = req.headers.playerid;
    if (playerId) {
      try {
        let existedUser = await User.findOne({
          or: [{ androidPlayerId: playerId }, { iosPlayerId: playerId }],
        });
        //remove key from existed user
        let update = {};
        if (existedUser && existedUser.id) {
          let indexOfAndroid =
            existedUser.androidPlayerId && _.size(existedUser.androidPlayerId)
              ? existedUser.androidPlayerId.indexOf(playerId)
              : -1;
          let indexOfIos =
            existedUser.iosPlayerId && _.size(existedUser.iosPlayerId)
              ? existedUser.iosPlayerId.indexOf(playerId)
              : -1;
          if (indexOfAndroid > -1) {
            update.androidPlayerId = existedUser.androidPlayerId.slice(
              indexOfAndroid + 1
            );
          }
          if (indexOfIos > -1) {
            update.iosPlayerId = existedUser.iosPlayerId.slice(indexOfIos + 1);
          }
          await User.update({ id: existedUser.id }, update);
        }
      } catch (e) {
        console.log(e);
      }
    }
  },
};

export default authService;
