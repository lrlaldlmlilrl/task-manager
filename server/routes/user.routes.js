import express from "express";
import { deleteUser, getAllUsers, getUserById, updateUser } from "../controller/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const userRouter = express.Router();

userRouter.get("/users", authMiddleware, getAllUsers);
userRouter.get("/users/:id", authMiddleware, getUserById);
userRouter.put("/users/:id", authMiddleware, adminMiddleware, updateUser);
userRouter.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

export { userRouter };
