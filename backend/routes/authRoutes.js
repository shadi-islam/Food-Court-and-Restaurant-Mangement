import express from "express";
import {
  adminLogin,
  adminIsAuth,
  guestLogin,
  getProfile,
  isAuth,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
const authRoutes = express.Router();

authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.post("/guest", guestLogin);
authRoutes.post("/admin/login", adminLogin);
authRoutes.get("/admin/is-auth", adminOnly, adminIsAuth);
// Backwards-compat alias (some frontends use /admin-login)
authRoutes.post("/admin-login", adminLogin);
authRoutes.post("/logout", logoutUser);
authRoutes.get("/profile", protect, getProfile);
authRoutes.get("/is-auth", protect, isAuth);

export default authRoutes;
