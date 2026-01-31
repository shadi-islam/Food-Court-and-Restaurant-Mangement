/**
 * Seed script to initialize MongoDB with super_admin and admin users
 * Run: node backend/scripts/seed.js
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config({
  path: new URL("../.env", import.meta.url).pathname,
});

const seed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "shadiislamapurbo@gmail.com";
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "betrayer24";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@restaurant.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    // Check if super admin exists
    let superAdmin = await User.findOne({ email: superAdminEmail });
    if (!superAdmin) {
      const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 10);
      superAdmin = await User.create({
        name: "Super Admin",
        email: superAdminEmail,
        password: hashedSuperAdminPassword,
        isAdmin: true,
        adminLevel: "super_admin",
      });
      console.log(`✅ Super admin created: ${superAdminEmail}`);
    } else {
      console.log(`⚠️  Super admin already exists: ${superAdminEmail}`);
    }

    // Check if normal admin exists
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: hashedAdminPassword,
        isAdmin: true,
        adminLevel: "admin",
      });
      console.log(`✅ Admin created: ${adminEmail}`);
    } else {
      console.log(`⚠️  Admin already exists: ${adminEmail}`);
    }

    console.log("\n📋 Credentials:");
    console.log(`Super Admin - Email: ${superAdminEmail}, Password: ${superAdminPassword}`);
    console.log(`Admin - Email: ${adminEmail}, Password: ${adminPassword}`);
    console.log("\n✨ Seed completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seed();
