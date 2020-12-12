import express from "express";
var router = express.Router();

import { NotificationController } from "./controller";

router
  .post("/send", NotificationController.sendNotification)
  .post("/paginate", NotificationController.paginate);

module.exports = router;
