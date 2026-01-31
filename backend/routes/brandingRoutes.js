import express from "express";
import { getBranding, updateBranding } from "../controllers/brandingController.js";
import { superAdminOnly } from "../middlewares/authMiddleware.js";

const brandingRoutes = express.Router();

// Public route: fetch branding
brandingRoutes.get("/", getBranding);

// Super admin only route: update branding
brandingRoutes.put("/", superAdminOnly, updateBranding);

export default brandingRoutes;
