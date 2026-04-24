import { sequelize, DataTypes } from "./index.js";

const Project = sequelize.define("Project", {
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
    color: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "#8b5cf6" // Фиолетовый по умолчанию
    }
});

export { Project };
