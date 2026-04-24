import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
    try {
        const { login, password, fullName, phone, role } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ where: { login } });
        if (existingUser) {
            return res.status(400).json({ message: "Пользователь с таким логином уже существует" });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            login,
            password: hashPassword,
            fullName,
            phone,
            role: role || "user"
        });

        res.status(201).json({ message: "Пользователь успешно зарегистрирован" });
    } catch (error) {
        console.error("Ошибка регистрации:", error);
        res.status(500).json({ message: "Ошибка регистрации" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { login, password } = req.body;

        const user = await User.findOne({
            where: { login }
        });

        if (!user) {
            return res.status(403).json({ message: "Неверный логин или пароль" });
        }

        const isPassword = await bcrypt.compare(password, user.password);
        
        if (!isPassword) {
            return res.status(403).json({ message: "Неверный логин или пароль" });
        }

        const token = generateToken({ id: user.id });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 3600000 // 1 час
        });

        res.json({ message: "Пользователь вошел успешно" });
    } catch (error) {
        console.error("Ошибка входа:", error);
        res.status(500).json({ message: "Ошибка входа" });
    }
};

const logoutUser = async (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Выход выполнен успешно" });
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json(user);
    } catch (error) {
        console.error("Ошибка получения профиля:", error);
        res.status(500).json({ message: "Ошибка получения профиля" });
    }
};

export { registerUser, loginUser, logoutUser, getProfile };
