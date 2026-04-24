import { User } from "../models/User.js";

// Получить всех пользователей (только для админа)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // Исключаем пароль
            order: [['createdAt', 'DESC']]
        });

        res.json(users);
    } catch (error) {
        console.error("Ошибка получения пользователей:", error);
        res.status(500).json({ message: "Ошибка получения пользователей" });
    }
};

// Получить одного пользователя по ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json(user);
    } catch (error) {
        console.error("Ошибка получения пользователя:", error);
        res.status(500).json({ message: "Ошибка получения пользователя" });
    }
};

// Изменить роль пользователя (только для superadmin)
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Проверка прав (только superadmin может менять роли)
        const currentUser = await User.findByPk(req.user.id);
        if (!currentUser || currentUser.role !== "superadmin") {
            return res.status(403).json({ 
                message: "Доступ запрещён. Только супер-админ может изменять роли." 
            });
        }

        // Проверка валидности роли (только 3 роли)
        const validRoles = ["user", "manager", "superadmin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Неверная роль" });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        user.role = role;
        await user.save();

        const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ["password"] }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Ошибка обновления роли:", error);
        res.status(500).json({ message: "Ошибка обновления роли" });
    }
};

export { getAllUsers, getUserById, updateUserRole };
