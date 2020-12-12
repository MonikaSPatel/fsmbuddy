import catchAsync from "../../utils/catchAsync";
import Ads from "../ads/model";
import UserSubmittedTasks from "../userSubmittedTasks/model";
import moment from "moment";
export default {
  userAds: catchAsync(async (req, res, next) => {
    let loggedInUser = req.user;
    let startDate = moment().startOf("day");
    let endDate = moment().add("3, 'days").endOf("day");
    let ads = await Ads.find({
      updatedAt: { $lte: endDate.toDate(), $gte: startDate.toDate() },
    }).exec();
    let adsIds = ads.map((val) => {
      return val.id;
    });
    let userSubmittedAds = await UserSubmittedTasks.find({
      createdBy: loggedInUser._id,
      adsId: adsIds,
    })
      .populate("adsIds")
      .exec();
    if (userSubmittedAds && userSubmittedAds.length) {
      let userSubmittedAdsIds = userSubmittedAds.map((val) => {
        return val.adsId.toString();
      });
      let result = ads.filter((v) => {
        return userSubmittedAdsIds.indexOf(v.id) === -1;
      });
      return res.ok({ pending: result, submitted: userSubmittedAds });
    } else {
      return res.ok(ads);
    }
  }),
};
