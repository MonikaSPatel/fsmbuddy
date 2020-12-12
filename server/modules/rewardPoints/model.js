import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = mongoose.Schema(
  {
    pointsEarned: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
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
const modal = mongoose.model("RewardPoints", schema);
export default modal;
