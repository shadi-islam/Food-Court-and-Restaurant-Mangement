import express from "express";
import { getBranding, updateBranding } from "../controllers/brandingController.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const brandingRoutes = express.Router();

// Public route: fetch branding
brandingRoutes.get("/", getBranding);

// Admin route: update branding (admin and super_admin can update)
brandingRoutes.put("/", adminOnly, updateBranding);

export default brandingRoutes;
