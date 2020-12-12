import path  from "path";
import EmailService  from "./email";
import NotificationService from "../modules/notifications/service";
import fs  from "fs";
//import exec from "child_process/exec";

module.exports = {
  /**
   * @description: getting query builder of locations
   * @param options "{
   *                      "startWith":<Object>,
   *                      "sort":<Object>,
   *                      "project":<Object>,
   *                      "page":<Object>,
   *                      "limit":<Object>,
   *                }"
   * @param callback
   */
  getFilter: async options => {
    let filter = {
      where: {
        or: []
      }
    };
    // manage pagination logic
    if (options.page && options.limit) {
      filter.skip = (options.page - 1) * options.limit;
      filter.limit = options.limit;
    }

    // sort by request
    if (options.sort) {
      filter.sort = options.sort;
    } else {
      filter.sort = [{ createdAt: "DESC" }, { updatedAt: "DESC" }];
    }

    if (_.has(options, "isActive")) {
      filter.where.isActive = options.isActive;
    }

    if (_.has(options, "isDeleted")) {
      filter.where.isDeleted = options.isDeleted;
    }

    // filter by start with
    if (
      options.startWith &&
      options.startWith.keys &&
      options.startWith.keyword
    ) {
      _.forEach(options.startWith.keys, function(key) {
        if (key) {
          let orArray = {};
          orArray[key] = {
            startsWith: options.startWith.keyword
          };
          filter.where.or.push(orArray);
        }
      });
    }

    if (options.search && options.search.keys && options.search.keyword) {
      _.forEach(options.search.keys, function(key) {
        if (key) {
          let orArray = {};
          orArray[key] = {
            contains: options.search.keyword
          };
          filter.where.or.push(orArray);
        }
      });
    }
    // NOTE:- keep this filter at end
    if (_.has(options, "id")) {
      filter = {
        where: { id: options.id }
      };
    }
    // projection by request
    if (options.project) {
      filter.select = options.project;
    }
    if (options.filter) {
      filter.where = _.extend(filter.where, options.filter);
    }

    if (filter.where.or && !filter.where.or.length) {
      delete filter.where.or;
    }

    return filter;
  },
  /**
   * @description GC filter and remove
   * @param filter
   */
  gcFilter: async filter => {
    // remove un-necessary or
    if (filter && filter.where && filter.where.or && !filter.where.or.length) {
      delete filter.where.or;
    }
    // remove un-necessary and
    if (
      filter &&
      filter.where &&
      filter.where.and &&
      !filter.where.and.length
    ) {
      delete filter.where.and;
    }
    return filter;
  },
  /**
   *  update filter with count condition
   * @param filter
   * @returns {Promise.<void>}
   */
  async removePagination(filter) {
    return filter.where;
  },
  /**
   *  convert key of object to lower case
   * @param params : obj
   * @param keys : array
   * @returns {Promise.<*>}
   */
  async convertToLowercase(params, keys) {
    _.each(keys, k => {
      if (params[k] && typeof params[k] == "string")
        params[k] = params[k].toLowerCase();
    });
    return params;
  },
  /**
   * store file on given path
   * @param option
   * @returns {Promise.<void>}
   */
  async storeFile(req, option) {
    return await new Promise((resolve, reject) => {
      req.file("file").upload(
        {
          dirname: option.storePath,
          maxBytes: option.limit || 1024 * 1024 * 9
        },
        function(err, files) {
          if (err) return reject({ err: err, message: "ERROR." });
          else if (files && files.length) {
            let link = path.basename(files[0].fd);
            return resolve({ link: link });
          } else {
            return reject({ err: "", message: "Please select excel file." });
          }
        }
      );
    });
  },
  /**
   *  convert csv to json
   * @param: option{
   * path: <path to store in dir>
   * }
   * @returns {Promise.<*>}
   */
  async convertCsvToJson(option) {
    try {
      const csvFilePath = option.path;
      const csv = require("csvtojson");
      return await new Promise((resolve, reject) => {
        let jsonData = [];
        csv()
          .fromFile(csvFilePath)
          .on("json", jsonObj => {
            jsonData.push(jsonObj);
          })
          .on("done", error => {
            resolve({ data: jsonData });
          });
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  /**
   * create otp string
   * @param option
   */
  generateOtp(option) {
    // TODO :- uncomment this in production
    //return Math.floor(1000 + Math.random() * 9000);
    return 1234;
  },
  /**
   * @description: getting default sync
   * @param options "{
   *                      "lastSyncDate":<datetime>
   *                }"
   */
  getSyncDateFilter: options => {
    let filter = {
      where: {}
    };
    // manage pagination logic
    if (options.page && options.limit) {
      filter.skip = (options.page - 1) * options.limit;
      filter.limit = options.limit;
    }
    // sort by request
    if (options.sort) {
      filter.sort = options.sort;
    }
    // filter by last sync date
    let lastSyncDate = moment(options.lastSyncDate);
    filter["where"].or = [
      {
        createdAt: {
          ">=": lastSyncDate.toISOString()
        }
      },
      {
        updatedAt: {
          ">=": lastSyncDate.toISOString()
        }
      }
    ];
    return filter;
  },
  /**
   * Filter for Rap Price and Discount Price API
   * @param options
   * @returns {{where: {or: {}}}}
   */
  /**
   * Format Master and SubMaster according to require format
   * @param masters
   * @returns {{}}
   */
  formatMasters: masters => {
    let response = {};
    _.each(masters, function(master, key) {
      response[key] = {};
      _.each(master.subMasters, function(submaster, k) {
        if (key.indexOf("RANGE") !== -1) {
          response[key][submaster.code] = submaster.name;
        } else {
          response[key][submaster.code] = submaster.id;
        }
      });
    });
    return response;
  },
  spliceParamsOnUpdate(data) {
    return _.omit(data, ["id", "createdAt", "updatedAt"]);
  },
  async sendMailSMSAndPushNotification(options) {
    if (!options.action) {
      return false;
    }
    let notificationSetting = await Settings.findOne({
      type: sails.config.SETTINGS.TYPE.APP_SETTING
    });
    let notificationAction = _.find(
      notificationSetting.notificationActions,
      value => {
        return value.action === options.action;
      }
    );
    if (
      !notificationAction ||
      (notificationAction &&
        !notificationAction.device &&
        !notificationAction.email &&
        !notificationAction.sms)
    ) {
      return false;
    }
    let mailOptions = options.mail;
    let pushNotificationOptions = options.pushNotification;
    let sms = options.sms;
    let users = options.users;
    try {
      users = await User.find({
        where: { id: users },
        select: ["emails", "mobiles", "name", "androidPlayerId", "iosPlayerId"]
      });
      let adminUsers = [];
      if (notificationAction.allowAdmin) {
        adminUsers = await User.find({
          where: { type: sails.config.USER.TYPE.ADMIN },
          select: ["id"]
        });
      }
      let notificationData = await NotificationService.upsertNotification({
        users: _.concat(users, adminUsers),
        content: pushNotificationOptions.content,
        data: pushNotificationOptions.data,
        action: options.action
      });

      await Promise.all(
        _.map(users, user => {
          let userEmail = _.find(user.emails, e => {
            return e.isPrimary;
          });

          let notification = _.find(notificationData, notification => {
            return notification.userId === user.id;
          });

          if (notificationAction) {
            if (notificationAction.email && userEmail && userEmail.email) {
              let mailObj = {
                subject: mailOptions.subject,
                to: userEmail.email,
                template: mailOptions.template,
                data: {
                  name: user.name || "-",
                  email: userEmail.email || "-",
                  message: mailOptions.message
                }
              };
              // send mail
              EmailService.send(mailObj);
            }
            if (notificationAction.device) {
              let playerIds = [];
              playerIds = playerIds.concat(user.androidPlayerId);
              playerIds = playerIds.concat(user.iosPlayerId);
              // attach notificationId
              _.assign(pushNotificationOptions.data, {
                notificationId: notification.id
              });

              // send push notification
              NotificationService.sendPushNotification({
                playerIds: playerIds,
                content: pushNotificationOptions.content,
                data: pushNotificationOptions.data
              });
            }
            if (notificationAction.sms) {
              let userMobile = _.find(user.mobiles, e => {
                return e.isPrimary;
              });
              if (userMobile && userMobile.countryCode) {
                let smsObj = {
                  message: sms.content,
                  mobiles: userMobile.countryCode + userMobile.mobile
                };
                // TODO:: Enable SMS
                // SmsService.send(smsObj);
              }
            }
          }
        })
      );

      return true;
    } catch (e) {
      throw new Error(e);
    }
  },

  async initilizeApp() {
    _.map(sails.config.DB_INDEXES, sphereIndex => {
      let model = sphereIndex.model;
      let db = sails.models[model.toLowerCase()].getDatastore().manager;
      db.collection(model).ensureIndex(
        { [sphereIndex.key]: sphereIndex.indexName },
        () => {
          // index assigned
        }
      );
    });
  },
  async fillPDF(sourcePDF, destPDF) {
    let pdfFillForm = require("pdf-fill-form");
    let fs =  require("fs");
    var pdfFields = pdfFillForm.readSync(sourcePDF);
    let fillData = {};
    _.each(pdfFields, function(field) {
      if (field.type === "checkbox") {
        fillData[field.name] = true;
      } else if (field.type === "text") {
        fillData[field.name] = "always";
      }
    });
    new Promise((resolve, reject) => {
      pdfFillForm
        .write(sourcePDF, fillData, {
          save: "pdf",
          cores: 4,
          scale: 0.2,
          antialias: true
        })
        .then(
          function(result) {
            fs.writeFile(destPDF, result, function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(destPDF);
              }
            });
          },
          function(err) {
            reject(err);
          }
        );
    });
  },
  permissionFilter(params, loginUser) {
    if (!params.filter) {
      params.filter = {};
    }
    let key = "";
    if (loginUser.type === sails.config.USER.TYPE.PHARMACY.ADMIN) {
      key = "pharmacyId";
    } else if (loginUser.type === sails.config.USER.TYPE.HOME.ADMIN) {
      key = "homeId";
    } else if (loginUser.type === sails.config.USER.TYPE.HOME.HOME_AREA.ADMIN) {
      key = "homeAreaId";
    } else if (
      loginUser.type === sails.config.USER.TYPE.ADMIN.SUPER ||
      loginUser.type === sails.config.USER.TYPE.ADMIN.GENERAL
    ) {
      return params;
    }
    params.filter[key] = _.first(loginUser.parentClientele).id;
    return params;
  },
  async getLoginUserWiseDependentRecord(params, loginUser, res) {
    let record = _.clone(params);
    let requestedData = [];
    if (loginUser.type === sails.config.USER.TYPE.PHARMACY.ADMIN) {
      //pharmacy admin
      requestedData = ["pharmacyId", "homeId", "homeAreaId"];
    } else if (loginUser.type === sails.config.USER.TYPE.HOME.ADMIN) {
      //home admin
      record.homeId = loginUser.parentClientele[0].id;
      requestedData = ["homeAreaId"];
      let home = await Clientele.findOne({
        where: { id: record.homeId },
        select: ["parentId"]
      });
      if (!home) {
        return res.badRequest(
          null,
          sails.config.message.PHARMACY_NOT_FOUND_FOR_HOME
        );
      }
      record.pharmacyId = home.parentId;
    } else if (loginUser.type === sails.config.USER.TYPE.HOME.HOME_AREA.ADMIN) {
      //home area admin
      record.homeAreaId = loginUser.parentClientele[0].id;
      let homeArea = await Clientele.findOne({
        where: { id: record.homeAreaId },
        select: ["id", "parentId"]
      });
      if (!homeArea) {
        return res.badRequest(
          null,
          sails.config.message.PHARMACY_NOT_FOUND_FOR_HOME
        );
      }
      record.homeId = homeArea.parentId;
      let home = await Clientele.findOne({
        where: { id: record.homeId },
        select: ["id", "parentId"]
      });
      if (!home) {
        return res.badRequest(
          null,
          sails.config.message.PHARMACY_NOT_FOUND_FOR_HOME
        );
      }
      record.pharmacyId = home.parentId;
    } else if (
      loginUser.type === sails.config.USER.TYPE.ADMIN.GENERAL ||
      loginUser.type === sails.config.USER.TYPE.ADMIN.SUPER
    ) {
      //writi admin
      if (params.assignType) {
        if (params.assignType === sails.config.USER.TYPE.HOME.HOME_AREA.ADMIN) {
          requestedData = ["pharmacyId", "homeId", "homeAreaId"];
        } else if (
          params.assignType === sails.config.USER.TYPE.PHARMACY.ADMIN
        ) {
          requestedData = ["pharmacyId"];
        }
      } else {
        requestedData = ["pharmacyId", "homeId", "homeAreaId"];
      }
    }
    //check for bad request
    if (params) {
      let badRequest = false;
      _.each(requestedData, function(key) {
        if (!_.has(params, key)) {
          badRequest = true;
        } else {
          record[key] = params[key];
        }
      });

      if (badRequest) {
        return res.badRequest(null, sails.config.message.BAD_REQUEST);
      }
    }

    return record;
  },
  async fillPDF(sourcePDF, destPDF, fillData) {
    let pdfFillForm = require("pdf-fill-form");
    try {
      let data = {};
      var pdfFields = pdfFillForm.readSync(sourcePDF);
      _.each(pdfFields, function(field) {
        if (_.isBoolean(fillData[field.name])) {
          data[field.name] = fillData[field.name];
        } else {
          data[field.name] = fillData[field.name] || "";
        }
      });
      return new Promise((resolve, reject) => {
        pdfFillForm
          .write(sourcePDF, data, {
            save: "pdf",
            cores: 4,
            scale: 0.2,
            antialias: true
          })
          .then(
            function(result) {
              fs.writeFile(destPDF, result, function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({ flag: true, data: destPDF });
                }
              });
            },
            function(err) {
              console.log(err);
              reject(err);
            }
          );
      });
    } catch (error) {
      console.log("error", error);
      throw new Error(error);
    }
  },
//   async convertPDFToImage(sourcePDF, destImagePath) {
//     try {
//       let convertCommand = `convert ${sourcePDF} +profile "icc"  -background white -alpha remove -alpha off ${destImagePath}`;
//       return await new Promise((resolve, reject) => {
//         exec(convertCommand, function(err, stdout, stderr) {
//           if (err) {
//             return reject({
//               message: "Failed to convert page to image",
//               error: err,
//               stdout: stdout,
//               stderr: stderr
//             });
//           }
//           return resolve({ flag: true, data: destImagePath });
//         });
//       });
//     } catch (error) {
//       console.log(error);
//       throw new Error(error);
//     }
//   },
  async populateSubFields(records, referenceMeta) {
    try {
      let refRecords = {};
      _.each(records, function(record) {
        _.each(referenceMeta, function(meta) {
          if (!refRecords[meta.reference_model]) {
            refRecords[meta.reference_model] = [];
          }
          let splitFieldName = meta.field_name.split(".");
          if (_.size(splitFieldName) === 3) {
            if (
              !_.isEmpty(
                record &&
                  record[splitFieldName[0]] &&
                  record[splitFieldName[0]][splitFieldName[1]] &&
                  record[splitFieldName[0]][splitFieldName[1]][
                    splitFieldName[2]
                  ]
              )
            ) {
              refRecords[meta.reference_model] = _.compact(
                _.concat(
                  refRecords[meta.reference_model],
                  _.map(
                    record[splitFieldName[0]],
                    splitFieldName[1],
                    splitFieldName[2]
                  )
                )
              );
            }
          } else if (_.size(splitFieldName) === 2) {
            // console.log('record map', splitFieldName, _.map(record[splitFieldName[0]], splitFieldName[1]));
            refRecords[meta.reference_model] = _.compact(
              _.concat(
                refRecords[meta.reference_model],
                _.map(record[splitFieldName[0]], splitFieldName[1])
              )
            );
          } else if (_.size(splitFieldName) === 1) {
            refRecords[meta.reference_model] = _.compact(
              _.concat(
                refRecords[meta.reference_model],
                record[splitFieldName[0]]
              )
            );
          }
        });
      });
      await Promise.all(
        _.map(refRecords, async function(recordIdArray, modelIdentity) {
          let meta = _.find(referenceMeta, function(v) {
            return modelIdentity === v.reference_model;
          });
          let filter = {
            where: {}
          };
          if (meta.reference_field) {
            let tmpRecordIdArray = _.compact(recordIdArray);
            if (tmpRecordIdArray && _.size(tmpRecordIdArray) > 0) {
              filter.where[meta.reference_field] = _.uniq(tmpRecordIdArray);
            } else {
              delete filter.where;
            }
          }
          if (meta.projection) {
            filter.select = meta.projection;
          }

          if (meta.self_populate_attr) {
            if (meta.self_populate_attr_projection) {
              refRecords[modelIdentity] = await sails.models[modelIdentity]
                .find(filter)
                .populate(
                  meta.self_populate_attr,
                  meta.self_populate_attr_projection
                );
            } else {
              refRecords[modelIdentity] = await sails.models[modelIdentity]
                .find(filter)
                .populate(meta.self_populate_attr);
            }
          } else {
            refRecords[modelIdentity] = await sails.models[modelIdentity].find(
              filter
            );
          }
        })
      );
      _.each(records, function(record) {
        _.each(referenceMeta, function(meta) {
          let splitFieldName = meta.field_name.split(".");
          if (_.size(splitFieldName) === 3) {
            if (record[splitFieldName[0]]) {
              _.each(record[splitFieldName[0]], function(subElement, index) {
                // subElement
                if (subElement && subElement[splitFieldName[1]]) {
                  _.each(subElement[splitFieldName[1]], function(
                    nestElement,
                    nestIndex
                  ) {
                    // nestElement
                    if (nestElement && nestElement[splitFieldName[2]]) {
                      record[splitFieldName[0]][index][splitFieldName[1]][
                        nestIndex
                      ] = _.find(refRecords[meta.reference_model], function(
                        refRecord
                      ) {
                        return (
                          refRecord[meta.reference_field] ===
                          nestElement[splitFieldName[2]]
                        );
                      });
                    }
                  });
                }
              });
            }
          } else if (_.size(splitFieldName) === 2) {
            _.each(record[splitFieldName[0]], function(subElement, index) {
              // subElement
              if (
                record[splitFieldName[0]] &&
                record[splitFieldName[0]][index]
              ) {
                record[splitFieldName[0]][index][splitFieldName[1]] = _.find(
                  refRecords[meta.reference_model],
                  function(refRecord) {
                    return (
                      refRecord[meta.reference_field] ===
                      subElement[splitFieldName[1]]
                    );
                  }
                );
              }
            });
          } else if (_.size(splitFieldName) === 1) {
            record[splitFieldName[0]] = _.find(
              refRecords[meta.reference_model],
              function(refRecord) {
                return (
                  refRecord[meta.reference_field] === record[splitFieldName[0]]
                );
              }
            );
          }
        });
      });
      // console.log('here', records);
      return records;
    } catch (e) {
      throw new Error(e);
    }
  },
  async getDeletedRecords(options) {
    let deleted = await DeleteSync.find({
      where: {
        module: sails.config.modules[options.moduleName],
        updatedAt: { ">=": new Date(options.lastSyncDate) }
      },
      select: ["recordId"]
    });
    return _.map(deleted, "recordId");
  },
//   async changeDetailValues(options) {
//     const UtilService = require(from "../../../../../EV-charging/server/api/services/util");
//     let data = UtilService.difference(options.newDocument, options.oldDocument);
//     let model = sails.models[options.tableName.toLowerCase()];
//     let associations = _.clone(model.associations);
//     _.each(model.attributes, (value, fieldName) => {
//       //update constant values
//       if (options.modifier[fieldName]) {
//         if (value.extendedDescription) {
//           _.each(value.extendedDescription, (v, k) => {
//             if (v === data[fieldName]) {
//               data[fieldName] = k;
//             }
//           });
//         }
//       }
//     });
//     await Promise.all(
//       _.map(associations, async value => {
//         //update model values
//         if (data[value.alias]) {
//           if (value.type === "model") {
//             let record = await sails.models[value.model].findOne({
//               id: data[value.alias].toString()
//             });
//             data[value.alias] = record.name || record.title;
//           }
//         }
//       })
//     );
//     return data;
//   },
  async addActivityLog(options) {
    try {
      let title = "";
      let obj = {
        userId: "",
        referenceId: "",
        action: 0,
        details: {},
        module: sails.config.modules[options.tableName.toLowerCase()]
      };
      if (options.operation === "create") {
        obj.action = sails.config.ACTIVITY_TYPES.CREATED;
      } else if (options.operation === "update") {
        obj.action = sails.config.ACTIVITY_TYPES.UPDATED;
      } else if (options.operation === "remove") {
        obj.action = sails.config.ACTIVITY_TYPES.REMOVED;
      }
      if (options.oldDocument) {
        //on update document
        obj.details = await this.changeDetailValues(options);
        if (obj.details && _.size(obj.details)) {
          obj.details = _.omit(obj.details, [
            "createdAt",
            "updatedAt",
            "addedBy",
            "updatedBy"
          ]);
        }
        if (obj.details) {
          if (obj.details.isDeleted) {
            obj.action = sails.config.ACTIVITY_TYPES.REMOVED;
          } else if (_.has(obj.details, "isActive")) {
            obj.action = sails.config.ACTIVITY_TYPES.ACTIVE_STATUS_UPDATED;
          } else if (_.has(obj.details, "status")) {
            obj.action = sails.config.ACTIVITY_TYPES.STATUS_UPDATED;
          } else if (_.has(obj.details, "password")) {
            obj.action = sails.config.ACTIVITY_TYPES.PASSWORD_RESET;
          } else {
            obj.action = sails.config.ACTIVITY_TYPES.UPDATED;
          }
        }
        title = options.oldDocument.name || options.oldDocument.title;

        obj.userId =
          options.oldDocument.updatedBy || options.newDocument.updatedBy;
        obj.referenceId = options.oldDocument.id;
      } else {
        if (!options.newDocument.length) {
          //is not array
          obj.details = _.omit(options.newDocument, [
            "createdAt",
            "updatedAt",
            "addedBy",
            "updatedBy"
          ]);
          obj.userId = options.newDocument.addedBy;
          obj.referenceId = options.newDocument.id;
          title = options.newDocument.name || options.newDocument.title;
        } else {
          obj.details.count = _.size(options.newDocument);
          obj.userId = options.newDocument[0].addedBy;
          title = options.newDocument[0].name || options.newDocument[0].title;
        }
      }

      obj.recordTitle = title;
      await ActivityLog.create(obj).meta({ skipAllLifecycleCallbacks: true });
    } catch (e) {
      console.log(e);
    }
  }
};
