import Masters from "./model.js";
import catchAsync from "../../utils/catchAsync.js";
import message from "./message.js";

export const masters = {
  parents: catchAsync(async (req, res, next) => {
    const parents = await Masters.find({ parent: null }).populate({
      path: "childs"
    });
    res.ok(parents, message.OK);
  })
};
export default masters;
