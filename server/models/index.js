import { DataTypes, Sequelize } from "sequelize";

const sequelize = new Sequelize("postgres://admin:123@localhost:5432/db", {
logging: false
});

export { sequelize, DataTypes };