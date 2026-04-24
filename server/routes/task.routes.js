import express from "express";
import { getAllTasks, createTask, updateTask, deleteTask } from "../controller/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const taskRouter = express.Router();

taskRouter.get("/tasks", authMiddleware, getAllTasks);
taskRouter.post("/tasks", authMiddleware, createTask);
taskRouter.put("/tasks/:id", authMiddleware, updateTask);
taskRouter.delete("/tasks/:id", authMiddleware, deleteTask);

export { taskRouter };
