import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware.js";
import {
  registerFcmToken,
  unregisterFcmToken,
  sendCustomNotificationToOrder,
} from "../controllers/notificationController.js";

const notificationRoutes = express.Router();

// User device token registration
notificationRoutes.post("/register-token", protect, registerFcmToken);
notificationRoutes.post("/unregister-token", protect, unregisterFcmToken);

// Admin custom notification for an order
notificationRoutes.post("/send/order/:orderId", protect, adminOnly, sendCustomNotificationToOrder);

export default notificationRoutes;
