import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity, // ✅ add
} from "../controllers/cartController.js";

const cartRoutes = express.Router();

cartRoutes.post("/add", protect, addToCart);
cartRoutes.get("/get", protect, getCart);
cartRoutes.delete("/remove/:menuId", protect, removeFromCart);

// ✅ NEW
cartRoutes.patch("/update/:menuId", protect, updateCartQuantity);

export default cartRoutes;
