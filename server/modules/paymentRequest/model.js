import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = mongoose.Schema(
  {
    redeemPoints: { type: Number, required: true },
    remark: { type: String },
    status: { type: String, enum: ["SUBMITTED", "APPROVED", "REJECTED"] },
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
const modal = mongoose.model("paymentrequest", schema);
export default modal;
