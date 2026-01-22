import express from "express";
import * as orderController from "../controllers/order.controller";
import verifyJWT from "../middleware/verifyJWT";

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// Get all orders
router.get("/", orderController.getAllOrders);

// Get order by ID
router.get("/:id", orderController.getOrder);

// Get orders by user ID
router.get("/user/:userId", orderController.getOrdersByUser);

// Create new order
router.post("/", orderController.createOrder);

// Update order
router.put("/:id", orderController.updateOrder);

// Update order status
router.patch("/:id/status", orderController.updateOrderStatus);

// Delete order
router.delete("/:id", orderController.deleteOrder);

// Cancel order
router.post("/:id/cancel", orderController.cancelOrder);

export default router;
