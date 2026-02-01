import NotificationToken from "../models/notificationTokenModel.js";
import Order from "../models/orderModel.js";
import { sendNotificationToUser } from "../services/notificationService.js";

// User registers device token (web/mobile)
export const registerFcmToken = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { token, platform = "web" } = req.body;

    console.log("[NotificationController] Token registration request:", { userId, token: token?.substring(0, 20) + '...', platform });

    if (!userId) {
      console.warn("[NotificationController] ❌ Unauthorized: no user ID");
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    if (!token) {
      console.warn("[NotificationController] ❌ Missing token");
      return res.status(400).json({ success: false, message: "token is required" });
    }

    // Upsert by token (token is globally unique)
    const doc = await NotificationToken.findOneAndUpdate(
      { token },
      { user: userId, platform, lastSeenAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("[NotificationController] ✅ Token registered/updated:", doc._id);
    return res.status(200).json({ success: true, message: "Notification token registered", token: doc.token });
  } catch (error) {
    console.error("[NotificationController] ❌ Token registration error:", error);
    return res.json({ message: "Internal server error", success: false });
  }
};

// Optional: allow client to remove a token
export const unregisterFcmToken = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: "Not authorized" });
    if (!token) return res.status(400).json({ success: false, message: "token is required" });

    await NotificationToken.deleteOne({ token, user: userId });
    return res.status(200).json({ success: true, message: "Notification token removed" });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

// Admin: send a custom notification to the user of a specific order
export const sendCustomNotificationToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { title = "Restaurant Update", message } = req.body;

    console.log("[NotificationController] Send notification request:", { orderId, title, message: message?.substring(0, 50) + '...' });

    if (!message) {
      console.warn("[NotificationController] ❌ No message provided");
      return res.status(400).json({ success: false, message: "message is required" });
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      console.warn("[NotificationController] ❌ Order not found:", orderId);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log("[NotificationController] Order found, user:", order.user?._id, order.user?.email);
    
    const result = await sendNotificationToUser({
      userId: order.user?._id,
      title,
      body: message,
      data: { orderId: order._id.toString(), status: order.status },
    });

    console.log("[NotificationController] Notification service result:", result);
    return res.status(200).json({ success: true, message: "Notification sent", result });
  } catch (error) {
    console.error("[NotificationController] ❌ Send notification error:", error);
    return res.json({ message: "Internal server error", success: false });
  }
};
