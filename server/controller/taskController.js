import { Task, User, Board } from "../models/associations.js";

// Получить все задачи
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'fullName', 'login'] },
                { model: User, as: 'creator', attributes: ['id', 'fullName', 'login'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(tasks);
    } catch (error) {
        console.error("Ошибка получения задач:", error);
        res.status(500).json({ message: "Ошибка получения задач" });
    }
};

// Создать задачу
const createTask = async (req, res) => {
    try {
        const { title, description, status, assignedTo, deadline, boardId } = req.body;

        // Преобразуем assignedTo в число, если это не null/undefined
        let assignedToId = null;
        if (assignedTo) {
            assignedToId = typeof assignedTo === 'number' ? assignedTo : parseInt(assignedTo);
            // Проверяем что это валидное число
            if (isNaN(assignedToId)) {
                assignedToId = null;
            }
        }

        const task = await Task.create({
            title,
            description,
            status: status || 'todo',
            assignedTo: assignedToId,
            deadline: deadline || null,
            boardId: boardId || null,
            createdBy: req.user.id
        });

        const fullTask = await Task.findByPk(task.id, {
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'fullName', 'login'] },
                { model: User, as: 'creator', attributes: ['id', 'fullName', 'login'] }
            ]
        });

        res.status(201).json(fullTask);
    } catch (error) {
        console.error("Ошибка создания задачи:", error);
        console.error("Stack:", error.stack);
        console.error("Детали:", error.errors);
        res.status(500).json({ message: "Ошибка создания задачи", detail: error.message });
    }
};

// Обновить задачу
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, assignedTo, deadline, boardId } = req.body;

        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({ message: "Задача не найдена" });
        }

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (assignedTo !== undefined) {
            // Преобразуем в число
            let assignedToId = null;
            if (assignedTo) {
                assignedToId = typeof assignedTo === 'number' ? assignedTo : parseInt(assignedTo);
                if (isNaN(assignedToId)) {
                    assignedToId = null;
                }
            }
            task.assignedTo = assignedToId;
        }
        if (deadline !== undefined) task.deadline = deadline;
        if (boardId !== undefined) task.boardId = boardId;

        await task.save();

        const updatedTask = await Task.findByPk(id, {
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'fullName', 'login'] },
                { model: User, as: 'creator', attributes: ['id', 'fullName', 'login'] }
            ]
        });

        res.json(updatedTask);
    } catch (error) {
        console.error("Ошибка обновления задачи:", error);
        res.status(500).json({ message: "Ошибка обновления задачи" });
    }
};

// Удалить задачу
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({ message: "Задача не найдена" });
        }

        await task.destroy();

        res.json({ message: "Задача удалена" });
    } catch (error) {
        console.error("Ошибка удаления задачи:", error);
        res.status(500).json({ message: "Ошибка удаления задачи" });
    }
};

export { getAllTasks, createTask, updateTask, deleteTask };
