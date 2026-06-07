import { DataTypes, Sequelize } from "sequelize";

const databaseUrl = process.env.DATABASE_URL || "postgres://admin:123@localhost:5432/db";

const sequelize = new Sequelize(databaseUrl, {
    logging: false,
    dialectOptions: process.env.NODE_ENV === "production"
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
        : {}
});

export { sequelize, DataTypes };
