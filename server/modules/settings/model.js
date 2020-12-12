import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = mongoose.Schema(
  {
    type: { type: String, enum: ["SLIDER_IMAGES"] },
    data: Schema.Types.Mixed,
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
const modal = mongoose.model("settings", schema);
export default modal;
