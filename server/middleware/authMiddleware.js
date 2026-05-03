import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Не авторизован" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'login', 'fullName', 'role']
        });

        if (!user) {
            return res.status(401).json({ message: "Пользователь не найден" });
        }

        req.user = {
            id: user.id,
            login: user.login,
            fullName: user.fullName,
            role: user.role
        };
        
        next();
    } catch (error) {
        return res.status(401).json({ message: "Невалидный токен" });
    }
};

export { authMiddleware };
