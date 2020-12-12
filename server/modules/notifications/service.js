import OneSignal from "onesignal-node";
import EmailService from "../../services/email";
import SmsService from "../../services/sms";
import constants from "./constant.js";

module.exports = {
  async sendPushNotification(options) {
    const myClient = new OneSignal.Client({
      userAuthKey: constants.ONE_SIGNAL.userAuthKey,
      // note that "app" must have "appAuthKey" and "appId" keys
      app: {
        appAuthKey: constants.ONE_SIGNAL.appAuthKey,
        appId: constants.ONE_SIGNAL.appId
      }
    });
    let playerIds = options.playerIds;
    let configObj = {
      contents: {
        en: options.content
      }
    };
    if (options.data) {
      configObj.data = options.data;
    }
    if (playerIds !== "all") {
      //send to specific playerids
      configObj.include_player_ids = _.compact(playerIds);
    } else {
      //send to all device
      configObj.included_segments = ["All"];
    }
    let notification = new OneSignal.Notification(configObj);

    myClient.sendNotification(notification, function(err, httpResponse, data) {
      if (err) {
        //sails.log.error("Something went wrong...");
        console.log("Something went wrong...");
      } else {
        //sails.log.info(data);
        console.log(data);
      }
    });
  },

  async notifyAdmin(options) {
    try {
      let users = await User.find({
        where: { type: sails.config.USER.TYPE.ADMIN },
        select: ["name", "emails", "mobiles"]
      });
      await Promise.all(
        _.map(users, user => {
          let userEmail = _.find(user.emails, function(e) {
            return e.isPrimary;
          });
          let mail_obj = {
            subject: "Daily Stats",
            to: userEmail.email,
            template: "notifyDailyStats",
            data: {
              name: user.name || "-",
              email: userEmail.email || "-",
              data: options.data
            }
          };
          //send mail
          EmailService.send(mail_obj);

          // send sms
          let userMobile = _.find(user.mobiles, function(e) {
            return e.isPrimary;
          });
          let smsObj = {
            message: sms.content,
            mobiles: userMobile.countryCode + userMobile.mobile
          };
          SmsService.send(smsObj);
        })
      );

      return true;
    } catch (e) {
      throw new Error(e);
    }
  },
  async upsertNotification(options) {
    try {
      let notifications = [];
      _.each(options.users, function(u) {
        notifications.push({
          title: options.content,
          data: options.data,
          userId: u.id,
          status: sails.config.NOTIFICATION.STATUS.SEND,
          addedBy: u.id,
          action: options.action
        });
      });
      let notificationsData = await NotificationList.createEach(
        notifications
      ).fetch();

      return notificationsData.newRecords;
    } catch (e) {
      throw new Error(e);
    }
  }
};
