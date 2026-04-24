import { User } from "./User.js";
import { Task } from "./Task.js";
import { Board } from "./Board.js";
import { Project } from "./Project.js";


Task.belongsTo(User, { foreignKey: "assignedTo", as: "assignee" });
User.hasMany(Task, { foreignKey: "assignedTo", as: "assignedTasks" });

Task.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(Task, { foreignKey: "createdBy", as: "createdTasks" });

Project.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(Project, { foreignKey: "createdBy", as: "projects" });

Board.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Project.hasMany(Board, { foreignKey: "projectId", as: "boards" });

Board.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(Board, { foreignKey: "createdBy", as: "userBoards" });

Task.belongsTo(Board, { foreignKey: "boardId", as: "board" });
Board.hasMany(Task, { foreignKey: "boardId", as: "tasks" });

export { User, Task, Board, Project };
