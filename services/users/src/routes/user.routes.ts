import express from "express";
import * as UserController from "../controllers/user.controller";
import verifyJWT from "../middleware/verifyJWT";

const router = express.Router();

// Get all users - protected route with JWT verification
router.get("/", verifyJWT, UserController.getAllUsers);

// Delete user by ID - protected route with JWT verification
router.delete("/:id", verifyJWT, UserController.deleteUser);

export default router;
