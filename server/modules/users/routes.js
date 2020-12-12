import express from "express";
var router = express.Router();
var swagger = require("swagger-spec-express");
swagger.swaggerize(router);

import { UserController } from "./controller";
import { Auth } from "../../middleware/auth";
import restify from "express-restify-mongoose";
import model from "./model.js";
import restifyOptions from "../../services/restify.options";

router
  .post("/auth/register", UserController.register)
  .post("/socialAuth", UserController.socialAuth)
  .post("/auth/login", UserController.login)
  .post("/auth/sendOtp", UserController.sendOtp)
  .post("/auth/validateOtp", UserController.validateOtp)
  .post("/auth/forgot-password", UserController.forgotPassword)
  .post("/auth/reset-password/", UserController.resetPassword)
  .post("/update-password-by-user", UserController.passwordUpdateByUser)
  .post(
    "/upsert-playerId",
    [Auth.protect],
    UserController.notificationIdentifierUpsert
  );

restify.serve(router, model, {
  outputFn: (req, res, next) => {
    restifyOptions.outputFn(req, res, next);
  },
});
//swager implementation // working with routes
// swagger.common.parameters.addBody({
//   name: "register",
//   description: "test name",
//   required: true,
//   schema: {
//     type: "object",
//     properties: {
//       name: {
//         type: "string"
//       },
//       password: {
//         type: "string"
//       }
//     }
//   }
// });

// router.post("/auth/register", UserController.register).describe({
//   responses: {
//     200: {
//       description: "Returns example 1"
//     }
//   },
//   common: {
//     parameters: {
//       body: ["register"]
//     }
//   }
// });

module.exports = router;
