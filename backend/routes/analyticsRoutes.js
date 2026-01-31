import express from "express";
import { revenueRange, revenueThisMonth, revenueToday } from "../controllers/analyticsController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/revenue/today", protect, adminOnly, revenueToday);
router.get("/revenue/month", protect, adminOnly, revenueThisMonth);
router.get("/revenue/range", protect, adminOnly, revenueRange);

export default router;
