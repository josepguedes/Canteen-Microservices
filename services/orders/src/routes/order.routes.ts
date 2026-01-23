import express from "express";
import * as orderController from "../controllers/order.controller";
import verifyJWT from "../middleware/verifyJWT";

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT); 

// Get all orders
router.get("/", orderController.getAllOrders);//

// Get orders for the authenticated user (moved before /:id to avoid conflicts)
router.get("/my-orders", orderController.getOrdersByUser);//

// Get order by ID
router.get("/:id", orderController.getOrder);// ADD TO ADMIN

// Create new order
router.post("/", orderController.createOrder);//

// Update order
router.put("/:id", orderController.updateOrder);//

// Delete order
router.delete("/:id", orderController.deleteOrder);//

export default router;
