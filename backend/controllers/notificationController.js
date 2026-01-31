import NotificationToken from "../models/notificationTokenModel.js";
import Order from "../models/orderModel.js";
import { sendNotificationToUser } from "../services/notificationService.js";

// User registers device token (web/mobile)
export const registerFcmToken = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { token, platform = "web" } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: "Not authorized" });
    if (!token) return res.status(400).json({ success: false, message: "token is required" });

    // Upsert by token (token is globally unique)
    const doc = await NotificationToken.findOneAndUpdate(
      { token },
      { user: userId, platform, lastSeenAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Notification token registered", token: doc.token });
  } catch (error) {
    console.log(error);
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

    if (!message) return res.status(400).json({ success: false, message: "message is required" });

    const order = await Order.findById(orderId).populate("user");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const result = await sendNotificationToUser({
      userId: order.user?._id,
      title,
      body: message,
      data: { orderId: order._id.toString(), status: order.status },
    });

    return res.status(200).json({ success: true, message: "Notification sent", result });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};
