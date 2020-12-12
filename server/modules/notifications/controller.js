import EmailService from "../../services/email";
import SMSService from "../../services/sms";
import NotificationService from "./service";
import CommonService from "../../services/common";
import message from "./message.js";
import constant from "./constant.js";
import "../../constants/user.js";
import User from "../users/model";

export const NotificationController = {
  async paginate(req, res) {
    try {
      let params = req.allParams();
      // get filter
      let filter = await CommonService.getFilter(params);
      if (params.dateRange && params.dateRange.startDate) {
        filter.where.updatedAt = {
          ">=": new Date(params.dateRange.startDate),
          "<=": new Date(params.dateRange.endDate)
        };
      }

      let recordsList = await NotificationList.find(filter).meta({
        enableExperimentalDeepTargets: true
      });
      if (!recordsList.length) {
        return res.ok({}, message.LIST_NOT_FOUND);
      }
      let response = { list: recordsList };
      // count
      let countFilter = await CommonService.removePagination(filter);
      response.count = await NotificationList.count(countFilter).meta({
        enableExperimentalDeepTargets: true
      });

      return res.ok(response, message.OK);
    } catch (error) {
      console.log(error);

      return res.serverError(null, message.SERVER_ERROR);
    }
  },

  /**
   * send Notification to individual user
   * @method POST
   * @param req users:array
   * users:[
   * {mobile:{"mobile":"9876543210",
   *              "isPrimary":true},
   * email:{
   *          "email":"email@gmail.com",
   *          "isPrimary":true}
   *          },
   * id="user_id"]
   * @param res
   * @description:
   * @returns {*}
   * @author {*}
   * @see {*}
   */
  async sendNotification(req, res) {
    let params = req.body;

    try {
      if (
        !params ||
        !params.users ||
        _.isEmpty(params.users) ||
        !params.content
      ) {
        return res.badRequest(null, message.BAD_REQUEST);
      }

      await Promise.all(
        _.map(params.users, async usr => {
          let user = await User.findById(usr.id).select([
            "emails",
            "mobiles",
            "name",
            "androidPlayerId",
            "iosPlayerId"
          ]);
          if (params.type === constant.NOTIFICATION.EMAIL) {
            if (!params.subject || params.subject === "") {
              params.subject = constant.DEFAULT_MAIL_SUBJECT;
            }
            if (params.content && params.content !== "") {
              let emails = [];
              if (user) {
                _.each(user.emails, function(checkEmail) {
                  if (checkEmail) {
                    emails.push(checkEmail.email);
                  }
                });
              }
              let primaryEmails = emails.join();
              let mail_obj = {
                subject: params.subject,
                to: primaryEmails,
                template: "notificationEmail",
                data: {
                  content: params.content
                }
              };
              EmailService.send(mail_obj);
            }
          } else if (params.type === constant.NOTIFICATION.SMS) {
            if (params.content && params.content !== "") {
              let senderMobileNum = [];
              if (user) {
                _.each(user.mobiles, function(mbl) {
                  if (mbl) {
                    senderMobileNum.push(mbl.mobile);
                  }
                });
              }
              senderMobileNum = senderMobileNum.join();
              let smsObj = {
                message: params.content,
                mobiles: senderMobileNum
              };
              SMSService.send(smsObj);
            }
          } else {
            console.log("here push notify", user);
            let playerIds = [];
            //  playerIds = playerIds.concat(user.androidPlayerId);
            playerIds = playerIds.concat(user.iosPlayerId);

            NotificationService.sendPushNotification({
              playerIds: playerIds,
              content: params.content
            });
          }

          return user;
        })
      );
      res
        .status(200)
        .json({ status: "sucess", message: "Notification send Successfully" });
    } catch (e) {
      console.log(e);
      return res.serverError(err, message.SERVER_ERROR);
    }
  }
};
