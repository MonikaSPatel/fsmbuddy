import uuid from "uuid";
import regConst from "./constant";
import User from "./model";
import catchAsync from "../../utils/catchAsync.js";
import emailService from "../../services/email";
import bcrypt from "bcryptjs";
import { authService } from "./auth";
import jwt from "jsonwebtoken";
import config from "../../config/config.json";
import message from "./message";

export const userService = {
  socialAuth: catchAsync(async (params) => {
    let profile = params.profile;
    let where = {
      type: params.profile.type,
    };
    if (profile.email) {
      //if user already exist logged him in
      where["emails.email"] = profile.email;
    } else if (profile.facebookAuthId) {
      where.facebookAuthId = profile.facebookAuthId;
    } else if (profile.googleAuthId) {
      where.googleAuthId = profile.googleAuthId;
    }
    let user = await User.findOne(where);
    let register = false;
    let userDetail;
    if (!user) {
      //if user is not registered
      let data = {
        facebookAuthId: profile.facebookAuthId,
        googleAuthId: profile.googleAuthId,
        name: profile.displayName,
        type: profile.type,
      };
      if (profile.email) {
        data.emails = [
          {
            email: profile.email,
            isVerified: true,
            isPrimary: true,
          },
        ];
      } else {
        if (!profile.dob) {
          return {
            flag: false,
            message: message.EMAIL_DOB_IS_REQUIRED,
          };
        }
        return {
          flag: false,
          message: message.EMAIL_ID_REQUIRED,
        };
      }

      if (!profile.dob) {
        return {
          flag: false,
          message: message.DOB_IS_REQUIRED,
        };
      } else {
        data.dob = profile.dob;
      }
      if (profile.mobile) {
        data.mobiles = [
          {
            mobile: profile.mobile,
            countryCode: message.COUNTRY_CODE,
            isVerified: true,
            isPrimary: true,
          },
        ];
      }
      if (profile.photos && profile.photos.length > 0) {
        data.image = profile.photos[0].value;
      }

      if (profile.name && profile.name.firstName) {
        data.firstName = profile.name.firstName;
      }
      if (profile.name && profile.name.lastName) {
        data.lastName = profile.name.lastName;
      }
      let extensionsObj = {
        google: "jpg",
        facebook: "jpeg",
      };
      /*if (data.image) {
                //download image from url
                let imagePath = await CommonService.downloadFile({
                    fileUrl: data.image,
                    extension: extensionsObj[profile.provider]
                });
                if (imagePath) {
                    data.image = imagePath.flag ? imagePath.path : profile.photos[0].value;
                }
            }*/
      userDetail = await User.create(data).fetch();
      register = true;
    }
    // Update facebookAuthId or googleAuthId
    else {
      let updateSocialId = {};
      if (profile.facebookAuthId) {
        updateSocialId.facebookAuthId = profile.facebookAuthId;
      } else if (profile.googleAuthId) {
        updateSocialId.googleAuthId = profile.googleAuthId;
      }

      console.log("user.id ", user.id);
      userDetail = await User.update(
        { _id: user.id },
        { $set: updateSocialId },
        { new: true }
      ).exec();
      // userDetail = await User.find({_id: user.id}).lean().exec();
      // if (userDetail && _.size(userDetail)) {
      //     userDetail = userDetail[0];
      // }
      console.log("User: ", userDetail);
    }
    const token = authService.createSendToken(userDetail, 201, req, res);
    // return { flag: true, token, user: userDetail, register };
  }),
  async sendResetPasswordLink(user) {
    let token = uuid();
    let viewType = "/reset-password/";
    let otp_msg = "Click on the link below to reset your password.";
    let expires = moment().add(5, "minutes");
    console.log("-------------moment-----------1-------", moment());
    console.log("moment().add(5,'minutes')", moment().add(5, "minutes"));
    await User.update(
      { _id: user.id },
      { resetPasswordLink: { code: token, expireTime: expires } }
    ).exec();
    user.email = _.find(user.emails).email;
    let mail_obj = {
      subject: "Reset Password",
      to: user.email,
      template: "verifyLink",
      data: {
        name: user.name || "-",
        email: user.email || "-",
        message: otp_msg,
        content: "http://localhost:3002" + viewType + token,
        linkText: "Reset Password",
      },
    };
    emailService.send(mail_obj);
    return true;
  },
  async resetUserPassword(user, newPassword, currentPassword) {
    try {
      console.log("newPassword", newPassword);
      try {
        if (currentPassword) {
          await new Promise((resolve, reject) => {
            bcrypt.compare(currentPassword, user.password, async function (
              err,
              result
            ) {
              if (err || !result) {
                reject({
                  flag: false,
                  message: message.CURRENT_PASSWORD_WRONG,
                });
              } else {
                resolve();
              }
            });
          });
        }
      } catch (e) {
        return {
          flag: false,
          message: message.CURRENT_PASSWORD_WRONG,
        };
      }
      newPassword = await bcrypt.hash(newPassword, 12);
      console.log(user.id, newPassword);
      await User.updateOne(
        { _id: user.id },
        {
          resetPassword: {},
          password: newPassword,
        }
      ).exec();
      return { flag: true, message: message.USER_PASSWORD_RESET };
    } catch (e) {
      throw new Error(e);
    }
  },
  async notificationIdentifierUpsert(options) {
    console.log("1");
    let deviceType = options.deviceType;
    let playerId = options.playerId;
    let loginUser = options.loginUser;
    try {
      let existedUser = await User.findOne({
        $or: [{ androidPlayerId: playerId }, { iosPlayerId: playerId }],
      }).exec();
      //remove key from existed user
      let update = {};
      if (existedUser) {
        if (existedUser.id === loginUser.id) {
          return message.PLAYERID_DUPLICATE;
        }
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
        await User.update({ _id: existedUser.id }, update).exec();
      }
      //update key to new user
      if (deviceType == message.DEVICE_TYPE.ANDROID) {
        if (!loginUser.androidPlayerId) {
          loginUser.androidPlayerId = [];
        }
        loginUser.androidPlayerId.push(playerId);
        update.androidPlayerId = loginUser.androidPlayerId;
      } else {
        if (!loginUser.iosPlayerId) {
          loginUser.iosPlayerId = [];
        }
        loginUser.iosPlayerId.push(playerId);
        update.iosPlayerId = loginUser.iosPlayerId;
      }

      await User.update({ _id: loginUser.id }, update).exec();
      return message.PLAYERID_SAVED;
    } catch (e) {
      console.log(e);
      return false;
    }
  }, // register services
  createSendToken(user, statusCode, req, res) {
    const token = regService.signToken(user._id);
    console.log("token---------", token);
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + config.EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    });

    // Remove password from output
    user.password = undefined;
    let result = {};
    result.user = user;
    result.token = token;
    res.ok(result, message.OK);
  },
  signToken(id) {
    return jwt.sign({ id }, config.SECRET_KEY, {
      expiresIn: EXPIRES_IN_SECONDS,
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
};

export default userService;
