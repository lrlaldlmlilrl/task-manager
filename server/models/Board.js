import { sequelize, DataTypes } from "./index.js";

const Board = sequelize.define("Board", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true // Доска может быть без проекта
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "#3b82f6" // Синий по умолчанию
    }
});

export { Board };
