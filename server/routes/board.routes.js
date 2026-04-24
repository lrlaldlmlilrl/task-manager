import express from "express";
import { getBoards, createBoard, updateBoard, deleteBoard, getBoardTasks } from "../controller/boardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const boardRouter = express.Router();

boardRouter.get("/boards", authMiddleware, getBoards);
boardRouter.post("/boards", authMiddleware, createBoard);
boardRouter.put("/boards/:id", authMiddleware, updateBoard);
boardRouter.delete("/boards/:id", authMiddleware, deleteBoard);
boardRouter.get("/boards/:id/tasks", authMiddleware, getBoardTasks);

export { boardRouter };
