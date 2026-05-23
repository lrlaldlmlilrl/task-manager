import express from "express";
import { registerUser, loginUser, logoutUser, getProfile, updateProfile } from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.get("/profile", authMiddleware, getProfile);
authRouter.patch("/profile", authMiddleware, updateProfile);

export { authRouter };
