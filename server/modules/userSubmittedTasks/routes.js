import express from "express";
const router = express.Router();
import restify from "express-restify-mongoose";
import model from "./model";
import RewardPoints from "../rewardPoints/model";
import defaultRestifyOptions from "../../services/restify.options";
// router.post("/dashboard/reward-count", controller.rewardCount);
const pointPerTask = 1;
restify.serve(router, model, {
  ...defaultRestifyOptions,
  postUpdate: async (req, res, next) => {
    console.log("req.erm.result", req.erm.result);
    if(req.erm.result && req.erm.result.createdBy){
      let rewardPointForUser = await RewardPoints.findOne({userId: req.erm.result.createdBy});
      if(rewardPointForUser){
         await RewardPoints.updateOne({userId: req.erm.result.createdBy},{pointsEarned:rewardPointForUser.pointsEarned +pointPerTask});
      }else{
        await RewardPoints.create({
          userId: req.erm.result.createdBy,
          pointsEarned:pointPerTask
        });
      }
    }
    next();
  },
});
module.exports = router;
