import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
// Generate JWT
const generateToken = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("token", token, {
    httpOnly: true,
    // Browsers require `Secure` when `SameSite=None`.
    // In local dev (http://localhost) that combination will cause the cookie
    // to be rejected, which looks like "Not Authorized" on protected routes.
    // So we use Lax for development and None+Secure for production.
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({
        message: "Please fill all the fields",
        success: false,
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    return res.json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User does not exist", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: "Invalid credentials", success: false });
    }

    generateToken(res, { id: user._id, role: user.isAdmin ? "admin" : "user" });
    res.json({
      message: "User logged in successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

// Guest login: bypass registration and issue a short-lived JWT
export const guestLogin = async (req, res) => {
  try {
    // Create a minimal guest user record (so orders can reference a user)
    const rnd = Math.random().toString(16).slice(2, 10);
    const name = `Guest-${rnd}`;
    const email = `guest-${Date.now()}-${rnd}@guest.local`;
    const hashedPassword = await bcrypt.hash(email, 10);
    const guest = await User.create({
      name,
      email,
      password: hashedPassword,
      isGuest: true,
    });

    // 12h token is enough for a dining session
    const token = jwt.sign(
      { id: guest._id, role: "guest" },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 12 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Guest session started",
      user: { _id: guest._id, name: guest.name, email: guest.email, isGuest: true },
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    // Check if it's super admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    // Check if it's normal admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    let adminLevel = null;
    let authEmail = null;

    if (email === superAdminEmail && password === superAdminPassword) {
      adminLevel = "super_admin";
      authEmail = superAdminEmail;
    } else if (email === adminEmail && password === adminPassword) {
      adminLevel = "admin";
      authEmail = adminEmail;
    } else {
      return res.json({ message: "Invalid credentials", success: false });
    }

    // Issue an admin-scoped JWT
    const token = jwt.sign(
      { email: authEmail, adminLevel, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Admin logged in successfully",
      admin: {
        email: authEmail,
        adminLevel,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const adminIsAuth = async (req, res) => {
  try {
    // adminOnly middleware already validates the token and role/email
    const email = req.user?.email;
    const adminLevel = req.user?.adminLevel || "admin";
    return res.json({ success: true, admin: { email, adminLevel } });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ message: "User logged out successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    res.json(user);
  } catch (error) {
    return res.json({ message: "Internal server error", success: false });
  }
};

export const isAuth = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    return res.json({ message: "Internal server error", success: false });
  }
};
