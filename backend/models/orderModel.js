import mongoose from "mongoose";

const ORDER_STATUSES = [
  "Approved",
  "Processing in Kitchen",
  "Ready to Serve",
  "Served",
];

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // For dine-in via QR, address isn't needed. Keep optional for flexibility.
    address: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Approved",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
    transactionId: {
      type: String,
      default: "",
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedTime: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

orderSchema.statics.ORDER_STATUSES = ORDER_STATUSES;

const Order = mongoose.model("Order", orderSchema);
export default Order;
