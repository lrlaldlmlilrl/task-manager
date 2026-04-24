import { Project, User, Board } from "../models/associations.js";

// Получить все проекты (общие для всех)
const getProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [
                { 
                    model: User, 
                    as: 'creator', 
                    attributes: ['id', 'fullName', 'login'] 
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(projects);
    } catch (error) {
        console.error("Ошибка получения проектов:", error);
        res.status(500).json({ message: "Ошибка получения проектов" });
    }
};

// Создать новый проект
const createProject = async (req, res) => {
    try {
        const { name, description, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Название проекта обязательно" });
        }

        const project = await Project.create({
            name: name.trim(),
            description: description || null,
            color: color || "#8b5cf6",
            createdBy: req.user.id
        });

        const fullProject = await Project.findByPk(project.id, {
            include: [
                { 
                    model: User, 
                    as: 'creator', 
                    attributes: ['id', 'fullName', 'login'] 
                }
            ]
        });

        res.status(201).json(fullProject);
    } catch (error) {
        console.error("Ошибка создания проекта:", error);
        res.status(500).json({ message: "Ошибка создания проекта" });
    }
};

// Обновить проект
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color } = req.body;

        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({ message: "Проект не найден" });
        }

        // Проверка прав
        const currentUser = await User.findByPk(req.user.id);
        if (project.createdBy !== req.user.id && currentUser.role !== "superadmin") {
            return res.status(403).json({ message: "Доступ запрещён" });
        }

        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;
        if (color !== undefined) project.color = color;

        await project.save();

        const updatedProject = await Project.findByPk(id, {
            include: [
                { 
                    model: User, 
                    as: 'creator', 
                    attributes: ['id', 'fullName', 'login'] 
                }
            ]
        });

        res.json(updatedProject);
    } catch (error) {
        console.error("Ошибка обновления проекта:", error);
        res.status(500).json({ message: "Ошибка обновления проекта" });
    }
};

// Удалить проект
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({ message: "Проект не найден" });
        }

        // Проверка прав
        const currentUser = await User.findByPk(req.user.id);
        if (project.createdBy !== req.user.id && currentUser.role !== "superadmin") {
            return res.status(403).json({ message: "Доступ запрещён" });
        }

        // Удаляем все доски этого проекта (и их задачи удалятся автоматически через каскад)
        await Board.destroy({ where: { projectId: id } });

        await project.destroy();

        res.json({ message: "Проект удалён" });
    } catch (error) {
        console.error("Ошибка удаления проекта:", error);
        res.status(500).json({ message: "Ошибка удаления проекта" });
    }
};

// Получить доски проекта
const getProjectBoards = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({ message: "Проект не найден" });
        }

        const boards = await Board.findAll({
            where: { projectId: id },
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
        console.error("Ошибка получения досок проекта:", error);
        res.status(500).json({ message: "Ошибка получения досок" });
    }
};

export { getProjects, createProject, updateProject, deleteProject, getProjectBoards };
