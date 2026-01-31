import Feedback from "../models/feedbackModel.js";

export const createFeedback = async (req, res) => {
  try {
    const { message, rating = 5, tableNumber } = req.body;
    if (!message)
      return res
        .status(400)
        .json({ success: false, message: "message is required" });

    const payload = {
      message,
      rating,
      tableNumber,
    };
    if (req.user?.id) payload.user = req.user.id;

    const feedback = await Feedback.create(payload);
    return res.status(201).json({ success: true, feedback });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return res.json({ success: true, feedback });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};
