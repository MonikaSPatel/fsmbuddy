import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CartSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    menuId: { type: Schema.Types.ObjectId, ref: "menu" },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("cart", CartSchema);

export default Cart;
