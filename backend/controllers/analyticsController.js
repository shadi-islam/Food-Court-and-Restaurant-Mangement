import Order from "../models/orderModel.js";

// Revenue only counts paid orders
const paidMatch = { paymentStatus: "Paid" };

export const revenueToday = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      { $match: { ...paidMatch, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: { $subtract: ["$totalAmount", { $ifNull: ["$discount", 0] }] } } } },
    ]);
    return res.json({ success: true, total: result[0]?.total || 0 });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const revenueThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const result = await Order.aggregate([
      { $match: { ...paidMatch, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: { $subtract: ["$totalAmount", { $ifNull: ["$discount", 0] }] } } } },
    ]);
    return res.json({ success: true, total: result[0]?.total || 0 });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const revenueRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate)
      return res
        .status(400)
        .json({ success: false, message: "startDate and endDate are required" });

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      { $match: { ...paidMatch, createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: { $subtract: ["$totalAmount", { $ifNull: ["$discount", 0] }] } } } },
    ]);
    return res.json({ success: true, total: result[0]?.total || 0 });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};
