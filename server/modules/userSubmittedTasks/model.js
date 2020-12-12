import mongoose from "mongoose";
const Schema = mongoose.Schema;
const pointPerTask = 1;
const schema = mongoose.Schema(
  {
    adsId: { type: Schema.Types.ObjectId, ref: "ads", required: true },
    proof: String,
    status: {
      type: String,
      enum: ["SUBMITTED", "APPROVED", "REJECTED"],
      default: "SUBMITTED",
    },
    remark: {type:String},
    pointsEarned: { type: Number, required: true, default: pointPerTask },
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
const modal = mongoose.model("usersubmittedtask", schema);
export default modal;
