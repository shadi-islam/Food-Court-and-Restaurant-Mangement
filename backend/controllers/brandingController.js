import Branding from "../models/brandingModel.js";

export const getBranding = async (req, res) => {
  try {
    let branding = await Branding.findOne();

    // If no branding doc exists, create default
    if (!branding) {
      branding = await Branding.create({
        siteName: "Restaurant",
        ownerName: "Owner",
        adminPortalName: "Admin Portal",
        footerText: "© 2024 All rights reserved.",
        logoUrl: "",
        updatedBy: "system",
      });
    }

    res.status(200).json({ success: true, branding });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const updateBranding = async (req, res) => {
  try {
    const { siteName, ownerName, adminPortalName, footerText, logoUrl } =
      req.body;

    // Validate that at least one field is provided
    if (
      siteName === undefined &&
      ownerName === undefined &&
      adminPortalName === undefined &&
      footerText === undefined &&
      logoUrl === undefined
    ) {
      return res.status(400).json({
        message: "No fields to update",
        success: false,
      });
    }

    let branding = await Branding.findOne();

    // If no branding doc exists, create one
    if (!branding) {
      branding = await Branding.create({
        siteName: siteName || "Restaurant",
        ownerName: ownerName || "Owner",
        adminPortalName: adminPortalName || "Admin Portal",
        footerText: footerText || "© 2024 All rights reserved.",
        logoUrl: logoUrl || "",
        updatedBy: req.user?.email || "system",
      });
      console.log("[updateBranding] New branding document created by:", req.user?.email);
    } else {
      // Update fields if provided
      if (siteName !== undefined) branding.siteName = siteName;
      if (ownerName !== undefined) branding.ownerName = ownerName;
      if (adminPortalName !== undefined)
        branding.adminPortalName = adminPortalName;
      if (footerText !== undefined) branding.footerText = footerText;
      if (logoUrl !== undefined) branding.logoUrl = logoUrl;
      branding.updatedBy = req.user?.email || "system";

      await branding.save();
      console.log("[updateBranding] Branding updated by:", req.user?.email, "- Logo URL:", logoUrl || "unchanged");
    }

    res.status(200).json({
      message: "Branding updated successfully",
      success: true,
      branding,
    });
  } catch (error) {
    console.error("[updateBranding] Error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
