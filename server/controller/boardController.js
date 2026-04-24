import { Board, User, Task } from "../models/associations.js";

// Получить все доски (общие для всех пользователей)
const getBoards = async (req, res) => {
    try {
        const boards = await Board.findAll({
            // Убираем фильтр where: { createdBy: req.user.id }
            // Теперь все видят все доски
            include: [
                { 
                    model: User, 
                    as: 'creator', 
                    attributes: ['id', 'fullName', 'login'] 
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(boards);
    } catch (error) {
        console.error("Ошибка получения досок:", error);
        res.status(500).json({ message: "Ошибка получения досок" });
    }
};

// Создать новую доску
const createBoard = async (req, res) => {
    try {
        const { name, description, color, projectId } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Название доски обязательно" });
        }

        const board = await Board.create({
            name: name.trim(),
            description: description || null,
            color: color || "#3b82f6",
            projectId: projectId || null,
            createdBy: req.user.id
        });

        const fullBoard = await Board.findByPk(board.id, {
            include: [
                { 
                    model: User, 
                    as: 'creator', 
                    attributes: ['id', 'fullName', 'login'] 
                }
            ]
        });

        res.status(201).json(fullBoard);
    } catch (error) {
        console.error("Ошибка создания доски:", error);
        res.status(500).json({ message: "Ошибка создания доски" });
    }
};

// Обновить доску
const updateBoard = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color } = req.body;

        const board = await Board.findByPk(id);

        if (!board) {
            return res.status(404).json({ message: "Доска не найдена" });
        }

        // Проверка прав (только создатель или superadmin могут редактировать)
        const currentUser = await User.findByPk(req.user.id);
        if (board.createdBy !== req.user.id && currentUser.role !== "superadmin") {
            return res.status(403).json({ message: "Доступ запрещён" });
        }

        if (name !== undefined) board.name = name;
        if (description !== undefined) board.description = description;
        if (color !== undefined) board.color = color;

        await board.save();

        const updatedBoard = await Board.findByPk(id, {
            include: [
                { 
                    model: User, 
                    as: 'creator', 
                    attributes: ['id', 'fullName', 'login'] 
                }
            ]
        });

        res.json(updatedBoard);
    } catch (error) {
        console.error("Ошибка обновления доски:", error);
        res.status(500).json({ message: "Ошибка обновления доски" });
    }
};

// Удалить доску
const deleteBoard = async (req, res) => {
    try {
        const { id } = req.params;

        const board = await Board.findByPk(id);

        if (!board) {
            return res.status(404).json({ message: "Доска не найдена" });
        }

        // Проверка прав (только создатель или superadmin могут удалять)
        const currentUser = await User.findByPk(req.user.id);
        if (board.createdBy !== req.user.id && currentUser.role !== "superadmin") {
            return res.status(403).json({ message: "Доступ запрещён" });
        }

        // Удаляем все задачи этой доски
        await Task.destroy({ where: { boardId: id } });

        await board.destroy();

        res.json({ message: "Доска удалена" });
    } catch (error) {
        console.error("Ошибка удаления доски:", error);
        res.status(500).json({ message: "Ошибка удаления доски" });
    }
};

// Получить задачи конкретной доски
const getBoardTasks = async (req, res) => {
    try {
        const { id } = req.params;

        const board = await Board.findByPk(id);

        if (!board) {
            return res.status(404).json({ message: "Доска не найдена" });
        }

        // Убираем проверку прав - все могут видеть задачи любой доски
        
        const tasks = await Task.findAll({
            where: { boardId: id },
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'fullName', 'login'] },
                { model: User, as: 'creator', attributes: ['id', 'fullName', 'login'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(tasks);
    } catch (error) {
        console.error("Ошибка получения задач доски:", error);
        res.status(500).json({ message: "Ошибка получения задач" });
    }
};

export { getBoards, createBoard, updateBoard, deleteBoard, getBoardTasks };
