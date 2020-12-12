const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MasterSchema = mongoose.Schema(
  {
    name: String,
    parent: { type: Schema.Types.ObjectId, ref: "masters" }
  },
  {
    toJSON: {
      virtuals: true
    }
  },
  {
    timestamps: true
  }
);

MasterSchema.virtual("childs", {
  ref: "masters",
  localField: "_id",
  foreignField: "parent",
  justOne: false // set true for one-to-one relationship
});

module.exports = mongoose.model("masters", MasterSchema);
