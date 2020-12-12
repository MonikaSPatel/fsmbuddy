import express from "express";
var router = express.Router();
import userRouter from "../modules/users/routes.js";
router.use("/", userRouter);

import masterRouter from "../modules/masters/routes.js";
router.use("/", masterRouter);

import notificationRouter from "../modules/notifications/routes.js";
router.use("/notification", notificationRouter);

import fileRouter from "../modules/fileUpload/routes.js";
router.use("/file", fileRouter);

// import restifyRouter from "../modules/restifyDemo/routes.js";
// router.use("/", restifyRouter);
import settingsRoutes from "../modules/settings/routes.js";
router.use("/", settingsRoutes);
import rewardPointsRoutes from "../modules/rewardPoints/routes.js";
router.use("/", rewardPointsRoutes);
import adsRoutes from "../modules/ads/routes.js";
router.use("/", adsRoutes);
import userSubmittedTasksRoutes from "../modules/userSubmittedTasks/routes.js";
router.use("/", userSubmittedTasksRoutes);
import paymentRequestRoutes from "../modules/paymentRequest/routes.js";
router.use("/", paymentRequestRoutes);
import videoFeedRoutes from "../modules/videoFeed/routes.js";
router.use("/", videoFeedRoutes);
import videoFeedLikesRoutes from "../modules/videoFeedLikes/routes.js";
router.use("/", videoFeedLikesRoutes);
module.exports = router;
