import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";

export const placeOrder = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      tableNumber,
      address = "",
      paymentMethod = "Cash",
      paymentStatus = "Unpaid",
      transactionId = "",
    } = req.body;

    if (!tableNumber)
      return res
        .status(400)
        .json({ message: "tableNumber is required", success: false });

    const cart = await Cart.findOne({ user: id }).populate("items.menuItem");

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Your cart is empty" });

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );

    const newOrder = await Order.create({
      user: req.user.id || null,
      tableNumber,
      items: cart.items.map((i) => ({
        menuItem: i.menuItem._id,
        quantity: i.quantity,
      })),
      totalAmount,
      address,
      paymentMethod,
      paymentStatus,
      transactionId,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Notify admins of new order in real-time
    const io = req.app.get("io");
    if (io) {
      const populatedOrder = await Order.findById(newOrder._id)
        .populate("user")
        .populate("items.menuItem");
      
      console.log("[ORDER PLACED] New order created:", {
        orderId: newOrder._id,
        tableNumber: newOrder.tableNumber,
        itemCount: newOrder.items.length,
        totalAmount: newOrder.totalAmount,
        customerName: populatedOrder?.user?.name || "Guest",
      });
      
      console.log("[SOCKET EMIT] Broadcasting order:new event to all connected admins");
      io.emit("order:new", {
        order: populatedOrder,
      });
      console.log("[SOCKET SUCCESS] order:new event emitted");
    } else {
      console.warn("[SOCKET WARNING] io instance not found - real-time update failed");
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await Order.find({ user: id }).sort({ createdAt: -1 });
    res.status(200).json({ orders, success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });
    res.status(200).json({ orders, success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    // Push realtime update to admin panels and customers
    const io = req.app.get("io");
    if (io) {
      // Broadcast to all admin panels
      io.emit("order:status", {
        orderId: order._id,
        status: order.status,
      });

      // Send to specific customer's order room
      io.to(`order:${order._id.toString()}`).emit("order:status", {
        orderId: order._id,
        status: order.status,
      });

      // Send notification when status changes to "Ready to Serve"
      if (status === "Ready to Serve") {
        io.to(`order:${order._id.toString()}`).emit("order:notification", {
          orderId: order._id,
          message: "Your order is ready to serve! Please come to the counter.",
          type: "ready",
        });
      }
    }

    res.json({ message: "order status updated", success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

// Update payment status (admin only)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!["Paid", "Unpaid"].includes(paymentStatus)) {
      return res
        .status(400)
        .json({ message: "Invalid payment status", success: false });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    const io = req.app.get("io");
    if (io) {
      // Broadcast to all admin panels
      io.emit("order:paymentStatus", {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
      });

      // Send to specific order room
      io.to(`order:${order._id.toString()}`).emit("order:paymentStatus", {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
      });
    }

    res.json({
      message: "Payment status updated",
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

// Update discount (admin only)
export const updateDiscount = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { discount } = req.body;

    if (discount === undefined || discount === null || discount < 0) {
      return res
        .status(400)
        .json({ message: "Invalid discount amount", success: false });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { discount },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    const io = req.app.get("io");
    if (io) {
      // Broadcast to all admin panels
      io.emit("order:discount", {
        orderId: order._id,
        discount: order.discount,
        totalAmount: order.totalAmount - discount,
      });

      // Send to specific order room
      io.to(`order:${order._id.toString()}`).emit("order:discount", {
        orderId: order._id,
        discount: order.discount,
        totalAmount: order.totalAmount - discount,
      });
    }

    res.json({
      message: "Discount updated",
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

// Update estimated time (admin only)
export const updateEstimatedTime = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estimatedTime } = req.body;

    if (estimatedTime === undefined || estimatedTime === null || estimatedTime < 0) {
      return res
        .status(400)
        .json({ message: "Invalid estimated time", success: false });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { estimatedTime },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    const io = req.app.get("io");
    if (io) {
      // Broadcast to all admin panels
      io.emit("order:estimatedTime", {
        orderId: order._id,
        estimatedTime: order.estimatedTime,
      });

      // Send to specific order room
      io.to(`order:${order._id.toString()}`).emit("order:estimatedTime", {
        orderId: order._id,
        estimatedTime: order.estimatedTime,
      });
    }

    res.json({
      message: "Estimated time updated",
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

// Public: get orders by table number (useful for guest sessions)
export const getOrdersByTable = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    if (!tableNumber)
      return res.status(400).json({ message: "tableNumber required", success: false });

    // Return recent orders for this table (last 48 hours)
    const since = new Date(Date.now() - 1000 * 60 * 60 * 48);
    const orders = await Order.find({ tableNumber: String(tableNumber), createdAt: { $gte: since } })
      .populate("user")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

// Protected: claim guest orders for current authenticated user by tableNumber
export const claimOrdersByTable = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized", success: false });
    if (!tableNumber) return res.status(400).json({ message: "tableNumber required", success: false });

    // Find guest users' orders for this table and reassign to current user
    const guestOrders = await Order.find({ tableNumber: String(tableNumber) }).populate("user");
    const toClaim = guestOrders.filter((o) => o.user && o.user.isGuest);

    const updated = [];
    for (const o of toClaim) {
      o.user = userId;
      await o.save();
      updated.push(o);
    }

    return res.status(200).json({ success: true, message: `${updated.length} orders claimed`, claimed: updated });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};
