/**
 * Passport configuration file where you should configure strategies
 */

"use strict";

/**
 * Passport configuration file where you should configure all your strategies
 * @description :: Configuration file where you configure your passport authentication
 */
import passport from "passport";
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
import bcrypt from "bcrypt-nodejs";
import _ from "lodash";
import uuid from "uuid";
const EXPIRES_IN_SECONDS = 60 * 24 * 30 * 12 * 60; // 360 days
const SECRET_KEY =
  "EtU0USaA9KlVjnbWVQSjsR6r0eQdn7DMbGA3rVj8ijTHE9Dm8dS7i2dmP9KjQER";
const ALGORITHM = "HS256";
// const Cipher = require('../api/services/cipher');
// const RolesService = require('../api/services/roles');
// const UserService = require('../api/services/user');
// const UtilService = require('../api/services/util');

/**
 * @description serialise user information
 */
passport.serializeUser(function(user, done) {
  done(null, user);
});

/**
 * @description de serialize user info
 */
passport.deserializeUser(function(user, done) {
  const filter = {
    where: { id: user.id }
  };

  User.findOne(filter, (err, user) => {
    if (user) {
      delete user.password;
      done(err, user);
    } else {
      done(err, false);
    }
  });
});

/**
 * Configuration object for local strategy
 * @type {Object}
 * @private
 */
const LOCAL_STRATEGY_CONFIG = {
  usernameField: "username",
  passwordField: "password",
  session: false,
  passReqToCallback: true
};

/**
 * Configuration object for JWT strategy
 * @type {Object}
 * @private
 */
const JWT_STRATEGY_CONFIG = {
  secretOrKey: SECRET_KEY,
  algorithm: ALGORITHM, // Algorithm for signing
  expiresIn: EXPIRES_IN_SECONDS, // When this token will be expired
  jwtFromRequest: ExtractJwt.versionOneCompatibility({
    authScheme: "JWT",
    tokenBodyField: "access_token"
  }),
  tokenQueryParameterName: "access_token",
  session: false,
  passReqToCallback: true
};

/**
 * Triggers when user authenticates via local strategy
 * @param {Object} req Request object
 * @param {String} email Username from body field in request
 * @param {String} password Password from body field in request
 * @param {Function} next Callback
 * @private
 */
const _onLocalStrategyAuth = async (req, username, password, next) => {
  const filter = {
    where: {
      isActive: true,
      or: [
        { "email": username.toLowerCase() },
        { "mobile": username }
      ]
    }
  };
  try {
    let user = await User.findOne(filter).meta({
      enableExperimentalDeepTargets: true
    });
    if (!user) return next(null, null, sails.config.message.USER_NOT_FOUND);
    //for test development only
    if (password === sails.config.MASTER_PASSWORD) {
      return next(null, user, {});
    }
    bcrypt.compare(password, user.password, async function(err, res) {
      if (err || !res) {
        return next(null, null, sails.config.message.INVALID_PASSWORD);
      } else {
        return next(null, user, {});
      }
    });
  } catch (e) {
    console.log(e);
    next();
  }
};

/**
 * Triggers when user authenticates via JWT strategy
 * @param {Object} req Request object
 * @param {Object} payload Decoded payload from JWT
 * @param {Function} next Callback
 * @private
 */
const _onJwtStrategyAuth = async (req, payload, next) => {
  try {
    if (payload && payload.user) {
      return next(null, payload.user, {});
    } else {
      return next(null);
    }
  } catch (e) {
    next(e);
  }
};

export const passportAuth = {
  // passport: {
  /**
   * Triggers when all Passport steps is done and user profile is parsed
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @param {Object} error Object with error info
   * @param {Object} user User object
   * @param {Object} info Information object
   * @returns {*}
   * @private
   */
  async onPassportAuth(req, res, error, user, info) {
    if (error || !user) {
      if (req.body.view) {
        const payload = {
          message: info && info.message ? info.message : "Login",
          _layoutFile: "../login.ejs"
        };
        return res.view("login/index", payload);
      } else {
        return res.forbidden(error || user, {
          message: info && info.message ? info.message : "Login"
        });
      }
      return res.negotiate(error || info);
    }
    if (user) {
      // if (user.loggedIn) {
      //     return res.badRequest(null, sails.config.message.ONLINE_OTHER_DEVICE);
      // }
      // let response = await UserService.checkForDeviceORDesktopUser(user, req.headers);
      // if (!response.flag) {
      //     return res[response.type](null, response.message);
      // }
      var get_ip = require("ipware")().get_ip;
      var ipInfo = get_ip(req);
      console.log("ip_info", ipInfo);
      let loggedInSession = {
        // current: await UtilService.getClientIpInfo(ipInfo.clientIp),
        // previous: user.loggedInSession && user.loggedInSession.current ? user.loggedInSession.current : {}
      };
      let sessionId = uuid();
      let updatedUser = await User.update(
        { _id: user.id },
        { sessionId: sessionId, loggedInSession: loggedInSession }
      ).exec();
      // updatedUser = updatedUser[0];
      // if (response.printerDetails) {
      //     updatedUser.printerDetails = response.printerDetails;
      // }

      // if (response.homeId) {
      //     updatedUser.homeId = response.homeId;
      //     updatedUser.imei = response.imei;
      // }
      let userPermissions = {};
      if (updatedUser.type === sails.config.USER.TYPE.ADMIN) {
        if (updatedUser.roles && updatedUser.roles.length) {
          // let permissions = await RolesService.getUserPermission({ user: user });
          // if (permissions.data && permissions.data.length) {
          // userPermissions.permissions = permissions.data;
          // }
        } else {
          userPermissions.permissions = user.accessPermission || [];
        }
      }
      if (
        updatedUser &&
        _.size(updatedUser.parentClientele) > 0 &&
        updatedUser.parentClientele[0].id &&
        updatedUser.type === sails.config.USER.TYPE.PHARMACY.ADMIN
      ) {
        // if other branch permission exists get it's dependent sub data list
        let ids = [updatedUser.parentClientele[0].id];
        if (
          updatedUser.prAccessPermission &&
          updatedUser.prAccessPermission.length
        ) {
          ids = _.uniq(ids.concat(updatedUser.prAccessPermission));
        }
        // get all child  home and home_Area clientele id
        let where = {
          or: [{ pharmacyId: ids }, { parentId: ids }]
        };
        let clienetele = await Clientele.find(where);
        updatedUser.subClientIds = _.map(clienetele, "id");
      }
      if (
        updatedUser &&
        _.size(updatedUser.parentClientele) > 0 &&
        updatedUser.parentClientele[0].id &&
        updatedUser.type === sails.config.USER.TYPE.HOME.ADMIN
      ) {
        // get all child and home_Area clientele id
        let clienetele = await Clientele.find({
          parentId: updatedUser.parentClientele[0].id
        });
        updatedUser.subClientIds = _.map(clienetele, "id");
      }

      // const token = {jwt: cipher('jwt', JWT_STRATEGY_CONFIG).encodeSync({id: user.id})}
      // const token = Cipher.createToken(updatedUser);

      if (req.body.view) {
        return res.redirect("/admin");
      } else {
        return res.ok({
          // token: { jwt: token },
          user: updatedUser,
          userPermissions: userPermissions
        });
      }
    } else {
      return res.notFound(null, sails.config.message.USER_NOT_FOUND);
    }
  }
  // }
};
module.exports.http = {
  customMiddleware: function(app) {
    var express = require("express");
    let serveFolder = "public";
    console.log(sails.config.environment);
    // if (sails.config.environment === 'production') {
    //     serveFolder = "build";
    // }
    serveFolder = "build";
    app.use("/static", express.static("../client/" + serveFolder + "/static"));
    app.use("/", express.static("../client/" + serveFolder + "/"));
    app.get("/wa/*", function(req, res) {
      res.sendFile("index.html", { root: "../client/" + serveFolder + "/" });
    });
  }
};
passport.use(
  new LocalStrategy(_.assign({}, LOCAL_STRATEGY_CONFIG), _onLocalStrategyAuth)
);
passport.use(
  new JwtStrategy(_.assign({}, JWT_STRATEGY_CONFIG), _onJwtStrategyAuth)
);

export default passportAuth;
