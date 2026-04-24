import express from "express";
import { getProjects, createProject, updateProject, deleteProject, getProjectBoards } from "../controller/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const projectRouter = express.Router();

projectRouter.get("/projects", authMiddleware, getProjects);
projectRouter.post("/projects", authMiddleware, adminMiddleware, createProject); 
projectRouter.put("/projects/:id", authMiddleware, updateProject);
projectRouter.delete("/projects/:id", authMiddleware, deleteProject);
projectRouter.get("/projects/:id/boards", authMiddleware, getProjectBoards);

export { projectRouter };
