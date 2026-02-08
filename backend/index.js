import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import brandingRoutes from "./routes/brandingRoutes.js";
import dotenv from "dotenv";
import connectCloudinary from "./config/cloudinary.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);
// database connection
connectDB();
connectCloudinary();
// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Detailed CORS configuration for cross-domain cookie handling
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://food-court-and-restaurant-mangement-1.onrender.com",
    ];
    
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true, // CRITICAL: Allow credentials (cookies, auth headers)
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
console.log("[CORS] Configured for cross-domain cookie sharing");
app.use(cookieParser());

// Debug middleware: log all incoming requests with cookies
app.use((req, res, next) => {
  const cookie = req.cookies.token ? "✓ Present" : "✗ Missing";
  console.log(`[REQUEST] ${req.method} ${req.path} - Cookie: ${cookie}, Origin: ${req.get('origin')}`);
  next();
});

// Socket.io (real-time order status) with matching CORS
const io = new Server(server, {
  cors: corsOptions, // Use same CORS config as HTTP
});

io.on("connection", (socket) => {
  // customer subscribes to its order room
  socket.on("order:subscribe", ({ orderId }) => {
    if (orderId) socket.join(`order:${orderId}`);
  });
});

app.set("io", io);
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("Hello from server");
});
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/config/branding", brandingRoutes);

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
