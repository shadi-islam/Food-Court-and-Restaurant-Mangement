import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // For guest users we generate a unique placeholder email
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isGuest: { type: Boolean, default: false },
    // Admin level: 'admin' or 'super_admin' (only relevant if isAdmin is true)
    adminLevel: {
      type: String,
      enum: ["admin", "super_admin"],
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
