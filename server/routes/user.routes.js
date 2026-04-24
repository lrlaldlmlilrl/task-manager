import express from "express";
import { getAllUsers, getUserById } from "../controller/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const userRouter = express.Router();

userRouter.get("/users", authMiddleware, adminMiddleware, getAllUsers);
userRouter.get("/users/:id", authMiddleware, getUserById);

export { userRouter };
