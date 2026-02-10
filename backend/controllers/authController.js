import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { validateEmail, validateName, validatePassword } from "../utils/validators.js";

// Generate JWT
const generateToken = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  const cookieOptions = {
    httpOnly: true,
    secure: true, // MUST be true when sameSite: "none"
    sameSite: "none", // Allow cross-site cookies
    maxAge: 24 * 60 * 60 * 1000,
    path: "/", // Critical: make cookie available to all paths
  };
  
  console.log(`[generateToken] Setting cookie with options:`, {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    httpOnly: cookieOptions.httpOnly,
    path: cookieOptions.path,
    env: process.env.NODE_ENV,
  });
  
  res.cookie("token", token, cookieOptions);
  console.log(`[generateToken] Cookie set. Header should contain Set-Cookie`);
  return token;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // SECURITY: Input validation
    if (!name || !email || !password) {
      return res.json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    if (!validateEmail(email)) {
      return res.json({
        message: "Invalid email format",
        success: false,
      });
    }

    if (!validateName(name)) {
      return res.json({
        message: "Name must be between 2-100 characters and contain only letters, spaces, hyphens, or apostrophes",
        success: false,
      });
    }

    if (!validatePassword(password)) {
      return res.json({
        message: "Password must be at least 8 characters with uppercase, lowercase, and number",
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
    console.log(`[loginUser] Login attempt for email: ${email}`);
    
    // SECURITY: Input validation
    if (!email || !password) {
      return res.json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    if (!validateEmail(email)) {
      return res.json({
        message: "Invalid email format",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[loginUser] User not found: ${email}`);
      return res.json({ message: "User does not exist", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[loginUser] Invalid password for user: ${email}`);
      return res.json({ message: "Invalid credentials", success: false });
    }

    generateToken(res, { id: user._id, role: user.isAdmin ? "admin" : "user" });
    console.log(`[loginUser] User logged in successfully: ${email}`);
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
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 12 * 60 * 60 * 1000,
    };
    
    res.cookie("token", token, cookieOptions);
    console.log(`[guestLogin] Guest session created and cookie set`);

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
    console.log(`[adminLogin] Admin login attempt for email: ${email}`);
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
      console.log(`[adminLogin] Super admin authenticated: ${email}`);
    } else if (email === adminEmail && password === adminPassword) {
      adminLevel = "admin";
      authEmail = adminEmail;
      console.log(`[adminLogin] Admin authenticated: ${email}`);
    } else {
      console.log(`[adminLogin] Invalid credentials for: ${email}`);
      return res.json({ message: "Invalid credentials", success: false });
    }

    // Issue an admin-scoped JWT
    const token = jwt.sign(
      { email: authEmail, adminLevel, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true, // MUST be true when sameSite: "none"
      sameSite: "none", // Allow cross-site cookies
      maxAge: 24 * 60 * 60 * 1000,
      path: "/", // Critical: make cookie available to all paths
    };
    
    console.log(`[adminLogin] Setting cookie with options:`, {
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      httpOnly: cookieOptions.httpOnly,
      path: cookieOptions.path,
    });
    
    res.cookie("token", token, cookieOptions);
    console.log(`[adminLogin] Cookie set successfully for: ${authEmail}`);

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
    const clearCookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };
    
    console.log(`[logoutUser] Clearing token cookie`);
    res.clearCookie("token", clearCookieOptions);
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
