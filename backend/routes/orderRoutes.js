import express from "express";

import {adminOnly,protect} from "../middlewares/authMiddleware.js"
import { getAllOrders, getUserOrders, placeOrder, updateOrderStatus, updatePaymentStatus, updateDiscount, updateEstimatedTime, getOrdersByTable, claimOrdersByTable } from "../controllers/orderController.js";
const orderRoutes=express.Router();
orderRoutes.post("/place",protect,placeOrder);
orderRoutes.get("/my-orders",protect,getUserOrders);
// public endpoint to allow guests to view orders for a table without auth
orderRoutes.get("/table/:tableNumber", getOrdersByTable);
orderRoutes.get("/orders",adminOnly,getAllOrders);
orderRoutes.put("/update-status/:orderId",adminOnly,updateOrderStatus);
orderRoutes.put("/update-payment/:orderId",adminOnly,updatePaymentStatus);
orderRoutes.put("/update-discount/:orderId",adminOnly,updateDiscount);
orderRoutes.put("/update-estimated-time/:orderId",adminOnly,updateEstimatedTime);

// protected endpoint to allow a logged-in user to claim guest orders for their table
orderRoutes.put("/claim/:tableNumber", protect, claimOrdersByTable);


export default orderRoutes;