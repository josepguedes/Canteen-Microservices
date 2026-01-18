import express from "express";
import * as UserController from "../controllers/user.controller";
import verifyJWT from "../middleware/verifyJWT";

const router = express.Router();

router.get("/", verifyJWT, UserController.getAllUsers);

router.post("/", UserController.createUser);

router.post("/login", UserController.loginUser);

router.get("/likes", verifyJWT, UserController.getLikedDishes);

router.post("/likes/:dishId", verifyJWT, UserController.addLikedDish);

router.put("/", verifyJWT, UserController.updateUser);

router.delete("/", verifyJWT, UserController.deleteUser);

export default router;
