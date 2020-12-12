import express from "express";
const router = express.Router();
import restify from "express-restify-mongoose";
import model from "./model";
import controller from "./controller";
import defaultRestifyOptions from "../../services/restify.options";
import { Auth } from "../../middleware/auth";
router.get("/user/ads", [Auth.protect], controller.userAds);
restify.serve(router, model, {
  ...defaultRestifyOptions,
});
module.exports = router;
