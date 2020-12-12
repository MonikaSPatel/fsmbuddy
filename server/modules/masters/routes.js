import express from "express";
var router = express.Router();
import restify from "express-restify-mongoose";
import model from "./model.js";
import restifyOptions from "../../services/restify.options";


//import { Auth } from "../../middleware/auth";

/* create masters apis with restify.*/
restify.serve(router, model, {
  outputFn: (req, res, next) => {
    restifyOptions.outputFn(req, res, next);
  }
});

const controller = require("./controller.js");

/* create parent list with childs. */

router.post("/master-parent-list", controller.masters.parents);

module.exports = router;
