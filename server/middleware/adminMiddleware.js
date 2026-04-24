import { User } from "../models/User.js";

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);

        // Разрешаем доступ для superadmin и manager
        if (!user || !["superadmin", "manager"].includes(user.role)) {
            return res.status(403).json({ message: "Доступ запрещён. Требуются права администратора." });
        }

        next();
    } catch (error) {
        console.error("Ошибка проверки прав:", error);
        res.status(500).json({ message: "Ошибка проверки прав" });
    }
};

export { adminMiddleware };
