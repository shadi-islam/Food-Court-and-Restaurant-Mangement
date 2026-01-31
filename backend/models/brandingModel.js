import mongoose from "mongoose";

const brandingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Restaurant",
    },
    ownerName: {
      type: String,
      default: "Owner",
    },
    adminPortalName: {
      type: String,
      default: "Admin Portal",
    },
    footerText: {
      type: String,
      default: "© 2024 All rights reserved.",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: String,
      default: "system",
    },
  },
  { timestamps: true }
);

const Branding = mongoose.model("Branding", brandingSchema);
export default Branding;
