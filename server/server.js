import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { sequelize } from "./models/index.js";
import dotenv from "dotenv"
dotenv.config()

console.log("🔍 Проверка .env:")
console.log("   PORT:", process.env.PORT)
console.log("   GIGACHAT_AUTH_KEY:", process.env.GIGACHAT_AUTH_KEY ? "✅ Установлен" : "❌ НЕ УСТАНОВЛЕН")


import "./models/associations.js";

import { authRouter } from "./routes/auth.routes.js";
import { taskRouter } from "./routes/task.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { boardRouter } from "./routes/board.routes.js";
import { projectRouter } from "./routes/project.routes.js";
import aiRoutes from "./routes/aiRoutes.js"
import { authMiddleware } from "./middleware/authMiddleware.js";
import { updateUserRole } from "./controller/userController.js";

const app = express();


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRouter);
app.use("/api", taskRouter);
app.use("/api", userRouter);
app.use("/api", boardRouter);
app.use("/api", projectRouter);
app.use("/api/ai", aiRoutes)

// Роут для изменения роли пользователя
app.patch("/api/users/:id/role", authMiddleware, updateUserRole);

app.get("/", (req, res) => {
    res.send("Сервер запущен ✅");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 API работает на http://localhost:${PORT}`);

    try {
        await sequelize.authenticate();
        console.log("✅ БД успешно подключена");

        await sequelize.sync({ alter: true });
        console.log("✅ Модели синхронизированы");

    } catch (error) {
        console.error("❌ Ошибка подключения к БД:", error.message);
    }
});
