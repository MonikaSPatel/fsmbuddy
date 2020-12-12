import express from "express";
var router = express.Router();

import restify from "express-restify-mongoose";
import question from "./question.model";
import answer from "./answer.model";
import menu from "./menu.model";
import cart from "./cart.model";
import restifyOptions from "../../services/restify.options";

/* create question apis with restify.*/
restify.serve(router, question, {
  outputFn: (req, res, next) => {
    restifyOptions.outputFn(req, res, next);
  },
});

/* create answers apis with restify */
restify.serve(router, answer, {
  outputFn: (req, res, next) => {
    restifyOptions.outputFn(req, res, next);
  },
});

/* create answers apis with restify */
restify.serve(router, menu, {
  outputFn: (req, res, next) => {
    restifyOptions.outputFn(req, res, next);
  },
});

/* create answers apis with restify */
restify.serve(router, cart, {
  outputFn: (req, res, next) => {
    restifyOptions.outputFn(req, res, next);
  },
});

/** populate sample
 *
 * http://localhost:7777/api/v1/questions?populate=[{"path":"answerIds"},{"path":"answers"},{"path":"answerDetails.answerId"}]
 *
 */

module.exports = router;
