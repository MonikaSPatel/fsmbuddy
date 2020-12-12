import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = mongoose.Schema(
  {
    videoId: { type: Schema.Types.ObjectId, ref: "videofeed" },
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);
const modal = mongoose.model("videofeedlikes", schema);
export default modal;
