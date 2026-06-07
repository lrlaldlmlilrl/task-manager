import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bcrypt from "bcryptjs";
import { sequelize } from "./models/index.js";
import { User } from "./models/User.js";
import dotenv from "dotenv";
import "./models/associations.js";
import { authRouter } from "./routes/auth.routes.js";
import { taskRouter } from "./routes/task.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { boardRouter } from "./routes/board.routes.js";
import { projectRouter } from "./routes/project.routes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { updateUserRole } from "./controller/userController.js";
import { seedDemoData } from "./seedDemoData.js";

dotenv.config();

console.log("Проверка .env:");
console.log("  PORT:", process.env.PORT);
console.log("  GIGACHAT_AUTH_KEY:", process.env.GIGACHAT_AUTH_KEY ? "установлен" : "не установлен");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRouter);
app.use("/api", taskRouter);
app.use("/api", userRouter);
app.use("/api", boardRouter);
app.use("/api", projectRouter);
app.use("/api/ai", aiRoutes);

app.patch("/api/users/:id/role", authMiddleware, updateUserRole);

app.get("/", (req, res) => {
    res.send("Сервер запущен");
});

const PORT = process.env.PORT || 3000;

const ensureDefaultSuperadmin = async () => {
    const existingSuperadmin = await User.findOne({ where: { role: "superadmin" } });
    if (existingSuperadmin) {
        return;
    }

    const login = process.env.DEFAULT_SUPERADMIN_LOGIN || "superadmin";
    const password = process.env.DEFAULT_SUPERADMIN_PASSWORD || "admin123";
    const fullName = process.env.DEFAULT_SUPERADMIN_FULL_NAME || "Главный Администратор";
    const phone = process.env.DEFAULT_SUPERADMIN_PHONE || "89999999999";

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
        login,
        password: passwordHash,
        fullName,
        phone,
        role: "superadmin"
    });

    console.log(`Создан пользователь superadmin: ${login}`);
};

app.listen(PORT, async () => {
    console.log(`API работает на http://localhost:${PORT}`);

    try {
        await sequelize.authenticate();
        console.log("БД успешно подключена");

        await sequelize.sync({ alter: true });
        console.log("Модели синхронизированы");

        await ensureDefaultSuperadmin();

        if (process.env.SEED_DEMO_DATA === "true") {
            await seedDemoData();
        }
    } catch (error) {
        console.error("Ошибка подключения к БД:", error.message);
    }
});
