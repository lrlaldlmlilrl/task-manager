import dotenv from "dotenv";
import "../models/associations.js";
import { sequelize } from "../models/index.js";
import { seedDemoData } from "../seedDemoData.js";

dotenv.config();

try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await seedDemoData();
    await sequelize.close();
} catch (error) {
    console.error("Failed to seed demo data:", error);
    await sequelize.close();
    process.exit(1);
}
