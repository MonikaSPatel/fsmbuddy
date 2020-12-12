"use strict";

module.exports = {
  GENDER_TYPE: {
    MALE: 1,
    FEMALE: 2
  },
  STATUS: {
    SUBMITTED: 1
  },
  PATIENT: {
    STATUS: {
      ACTIVE: 1,
      DISCHARGED: 2
    }
  },
  ACCOUNT_TYPE: {
    PERSONAL: 1,
    BUSINESS: 2
  },
  ADDRESS_TYPE: {
    HOME: 1,
    WORK: 2
  },
  DEFAULT_ERROR_RESPONSE_CODE: [
    "E_BAD_REQUEST",
    "E_FORBIDDEN",
    "E_NOT_FOUND",
    "E_UNAUTHORIZED",
    "E_USER_NOT_FOUND",
    "UNPROCESSABLE_ENTITY"
  ],
  COUNTRY_CODE: "+61",
  SMS: {
    URL: "http://coruscateitsolution.msg4all.com/GatewayAPI/rest",
    LOGIN_ID: "loanstudio",
    PASSWORD: "lysz6jmFA",
    SENDER_ID: "TESTMS"
  },
  DEVICE_TYPE: {
    ANDROID: 1,
    IPHONE: 2,
    ADMIN: 3,
    DESKTOP: 4
  }
};
