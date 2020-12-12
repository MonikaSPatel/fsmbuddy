import express from "express";
const router = express.Router();
import restify from "express-restify-mongoose";
import model from "./model";
import defaultRestifyOptions from "../../services/restify.options";
restify.serve(router, model, {
  ...defaultRestifyOptions,
});
module.exports = router;
