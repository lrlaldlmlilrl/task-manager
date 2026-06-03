import { User } from "../models/User.js";

const publicUserAttributes = ["id", "login", "fullName", "phone", "role"];
const editableUserFields = ["login", "fullName", "phone"];

const canManageUser = (currentUser, targetUser) => {
    if (!currentUser || !targetUser) return false;
    if (currentUser.role === "superadmin") return true;
    return currentUser.role === "manager" && targetUser.role !== "superadmin";
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: publicUserAttributes,
            order: [["createdAt", "DESC"]]
        });

        res.json(users);
    } catch (error) {
        console.error("Ошибка получения пользователей:", error);
        res.status(500).json({ message: "Ошибка получения пользователей" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ["password"] }
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

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const currentUser = await User.findByPk(req.user.id);
        if (!currentUser || currentUser.role !== "superadmin") {
            return res.status(403).json({
                message: "Доступ запрещен. Только супер-админ может изменять роли."
            });
        }

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

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await User.findByPk(req.user.id);
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        if (!canManageUser(currentUser, user)) {
            return res.status(403).json({ message: "Недостаточно прав для изменения пользователя" });
        }

        editableUserFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        await user.save();

        const updatedUser = await User.findByPk(id, {
            attributes: publicUserAttributes
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Ошибка обновления пользователя:", error);
        res.status(500).json({ message: "Ошибка обновления пользователя" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (String(id) === String(req.user.id)) {
            return res.status(400).json({ message: "Нельзя удалить самого себя" });
        }

        const currentUser = await User.findByPk(req.user.id);
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        if (!canManageUser(currentUser, user)) {
            return res.status(403).json({ message: "Недостаточно прав для удаления пользователя" });
        }

        await user.destroy();

        res.json({ message: "Пользователь удален" });
    } catch (error) {
        console.error("Ошибка удаления пользователя:", error);
        res.status(500).json({ message: "Ошибка удаления пользователя" });
    }
};

export { getAllUsers, getUserById, updateUserRole, updateUser, deleteUser };
