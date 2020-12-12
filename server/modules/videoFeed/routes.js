import express from "express";
const router = express.Router();
import restify from "express-restify-mongoose";
import model from "./model";
import likesModel from "../videoFeedLikes/model";
import defaultRestifyOptions from "../../services/restify.options";
restify.serve(router, model, {
  ...defaultRestifyOptions,
  postRead: async (req, res, next) => {
    const result = req.erm.result
    const statusCode = req.erm.statusCode;
    if (statusCode === 200) {
      for (let i = 0; i < result.length; i++) {
        let likesCount = await likesModel.where({ videoId: result[i]._id }).count()
        result[i]['likes'] = likesCount;
      }
    }
    req.erm.result = result;
    next();

  }
});
module.exports = router;
