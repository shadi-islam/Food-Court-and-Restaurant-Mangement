import express from "express";
import { createFeedback, getAllFeedback } from "../controllers/feedbackController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// customer can submit feedback (guest or registered)
router.post("/create", protect, createFeedback);

// admin reads all feedback
router.get("/all", protect, adminOnly, getAllFeedback);

export default router;
