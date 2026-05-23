import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getFieldError } from "../utils/userValidation.js";

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });
};

const serializeUser = (user) => ({
    id: user.id,
    login: user.login,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

const registerUser = async (req, res) => {
    try {
        const { login, password, fullName, phone, role } = req.body;

        if (!login?.trim() || !password?.trim() || !fullName?.trim() || !phone?.trim()) {
            return res.status(400).json({ message: "Заполните все поля корректно" });
        }

        const normalizedLogin = login.trim();
        const normalizedPassword = password.trim();
        const normalizedFullName = fullName.trim();
        const normalizedPhone = phone.trim();

        const validationError =
            getFieldError("login", normalizedLogin) ||
            getFieldError("password", normalizedPassword) ||
            getFieldError("fullName", normalizedFullName) ||
            getFieldError("phone", normalizedPhone);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const existingUser = await User.findOne({ where: { login: normalizedLogin } });
        if (existingUser) {
            return res.status(400).json({ message: "Пользователь с таким логином уже существует" });
        }

        const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
        if (existingPhone) {
            return res.status(400).json({ message: "Пользователь с таким номером телефона уже существует" });
        }

        const hashPassword = await bcrypt.hash(normalizedPassword, 10);
        await User.create({
            login: normalizedLogin,
            password: hashPassword,
            fullName: normalizedFullName,
            phone: normalizedPhone,
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
        const normalizedLogin = login?.trim();

        const user = await User.findOne({
            where: { login: normalizedLogin }
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
            sameSite: "lax",
            maxAge: 3600000
        });

        res.json(serializeUser(user));
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
            attributes: { exclude: ["password"] }
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

const updateProfile = async (req, res) => {
    try {
        const { login, fullName, phone } = req.body;

        if (!login?.trim() || !fullName?.trim() || !phone?.trim()) {
            return res.status(400).json({ message: "Заполните все поля корректно" });
        }

        const normalizedLogin = login.trim();
        const normalizedFullName = fullName.trim();
        const normalizedPhone = phone.trim();

        const validationError =
            getFieldError("login", normalizedLogin) ||
            getFieldError("fullName", normalizedFullName) ||
            getFieldError("phone", normalizedPhone);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        const existingLogin = await User.findOne({ where: { login: normalizedLogin } });
        if (existingLogin && existingLogin.id !== user.id) {
            return res.status(400).json({ message: "Пользователь с таким логином уже существует" });
        }

        const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
        if (existingPhone && existingPhone.id !== user.id) {
            return res.status(400).json({ message: "Пользователь с таким номером телефона уже существует" });
        }

        user.login = normalizedLogin;
        user.fullName = normalizedFullName;
        user.phone = normalizedPhone;
        await user.save();

        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ["password"] }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Ошибка обновления профиля:", error);
        res.status(500).json({ message: "Ошибка обновления профиля" });
    }
};

export { registerUser, loginUser, logoutUser, getProfile, updateProfile };
