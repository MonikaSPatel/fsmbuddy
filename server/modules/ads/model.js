import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = mongoose.Schema(
  {
    title: { type: String, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    imagePath: { type: "string", required: true },
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
const modal = mongoose.model("ads", schema);
export default modal;
