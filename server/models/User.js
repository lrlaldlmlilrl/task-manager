import { sequelize, DataTypes } from "./index.js";

const User = sequelize.define("User", {
    login: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true 
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    fullName: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    phone: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    role: { 
        type: DataTypes.STRING, 
        allowNull: false,
        defaultValue: "user" 
    }
});

export { User };
