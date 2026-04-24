import { sequelize, DataTypes } from "./index.js";

const Task = sequelize.define("Task", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "todo" // todo | inProgress | done
    },
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    boardId: {
        type: DataTypes.INTEGER,
        allowNull: true // Может быть null для задач без доски
    }
});

export { Task };
