import bcrypt from "bcryptjs";
import { User, Project, Board, Task } from "./models/associations.js";

const password = "demo1234";

const demoUsers = [
    { login: "director", fullName: "Серединов Михаил Леонидович", phone: "89020000001", role: "superadmin" },
    { login: "manager", fullName: "Юркина Анна Владимировна", phone: "89020000002", role: "manager" },
    { login: "analyst", fullName: "Зубенко Михаил Петрович", phone: "89020000003", role: "user" },
    { login: "developer", fullName: "Камалутдинов Радмир Альбертович", phone: "89020000004", role: "user" },
    { login: "designer", fullName: "Адамович Кирилл Сергеевич", phone: "89020000005", role: "user" },
    { login: "tester", fullName: "Николаева Елена Андреевна", phone: "89020000006", role: "user" },
    { login: "support", fullName: "Орлова Мария Игоревна", phone: "89020000007", role: "user" }
];

const demoProjects = [
    {
        name: "Корпоративный таск-менеджер",
        description: "Разработка и подготовка SoftAlert к публичной демонстрации.",
        color: "#2563eb",
        boards: [
            {
                name: "Запуск продукта",
                description: "Основная доска задач для релиза.",
                color: "#2563eb",
                tasks: [
                    ["Подключить production-домен", "Настроить softalert.ru и www.softalert.ru в Vercel.", "done", "developer", 1],
                    ["Настроить API-домен", "Привязать api.softalert.ru к Render и проверить CORS.", "inProgress", "developer", 2],
                    ["Проверить авторизацию на разных устройствах", "Проверить вход, cookie и работу профиля после логина.", "inProgress", "tester", 3],
                    ["Подготовить демо-данные", "Создать пользователей, проекты, доски и задачи для защиты.", "todo", "manager", 4],
                    ["Описать сценарий защиты", "Подготовить короткий маршрут демонстрации функций проекта.", "todo", "analyst", 5]
                ]
            },
            {
                name: "Интерфейс и UX",
                description: "Визуальные улучшения и удобство работы пользователей.",
                color: "#0f766e",
                tasks: [
                    ["Улучшить экран входа", "Сделать сообщения об ошибках понятными и аккуратными.", "done", "designer", -2],
                    ["Проверить адаптивность карточек", "Посмотреть dashboard на ноутбуке, планшете и телефоне.", "inProgress", "designer", 6],
                    ["Добавить пустые состояния", "Показать пользователю понятные экраны без задач и проектов.", "todo", "designer", 7],
                    ["Проверить контрастность кнопок", "Убедиться, что элементы читаются на светлом фоне.", "done", "tester", -1]
                ]
            }
        ]
    },
    {
        name: "Операционная работа отдела",
        description: "Пример реальных задач команды внутри компании.",
        color: "#7c3aed",
        boards: [
            {
                name: "Еженедельный план",
                description: "Задачи отдела на текущую неделю.",
                color: "#7c3aed",
                tasks: [
                    ["Собрать требования от руководителя", "Уточнить KPI, роли сотрудников и сценарии использования.", "done", "analyst", -4],
                    ["Подготовить отчет по задачам", "Сформировать список выполненных и просроченных задач.", "inProgress", "manager", 1],
                    ["Разобрать обращения пользователей", "Проверить сообщения от сотрудников и назначить ответственных.", "todo", "support", 2],
                    ["Обновить приоритеты спринта", "Перенести низкоприоритетные задачи на следующую неделю.", "todo", "manager", 3],
                    ["Провести регрессионное тестирование", "Проверить создание, редактирование и удаление задач.", "inProgress", "tester", 4]
                ]
            }
        ]
    },
    {
        name: "AI-помощник",
        description: "Демонстрационный проект для возможностей AI-ассистента.",
        color: "#db2777",
        boards: [
            {
                name: "AI backlog",
                description: "Задачи по улучшению AI-модуля.",
                color: "#db2777",
                tasks: [
                    ["Проверить ответы AI по текущим задачам", "Задать вопросы по проектам и сравнить ответы с данными в системе.", "todo", "analyst", 5],
                    ["Добавить контекст проектов в запрос", "Передавать AI список проектов, досок, задач и сотрудников.", "done", "developer", -3],
                    ["Подготовить вопросы для демонстрации", "Составить 5 коротких вопросов для защиты.", "inProgress", "manager", 2]
                ]
            }
        ]
    }
];

const getDeadline = (offsetDays) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    date.setHours(18, 0, 0, 0);
    return date;
};

const upsertUser = async (userData, passwordHash) => {
    const [user] = await User.findOrCreate({
        where: { login: userData.login },
        defaults: { ...userData, password: passwordHash }
    });

    await user.update({
        fullName: userData.fullName,
        phone: userData.phone,
        role: userData.role
    });

    return user;
};

const upsertByName = async (Model, name, values) => {
    const [record] = await Model.findOrCreate({
        where: { name },
        defaults: { name, ...values }
    });

    await record.update(values);
    return record;
};

const upsertTask = async ({ title, description, status, assignee, deadline, boardId, createdBy }) => {
    const [task] = await Task.findOrCreate({
        where: { title, boardId },
        defaults: {
            title,
            description,
            status,
            assignedTo: assignee.id,
            deadline,
            boardId,
            createdBy
        }
    });

    await task.update({
        description,
        status,
        assignedTo: assignee.id,
        deadline,
        boardId,
        createdBy
    });

    return task;
};

export const seedDemoData = async () => {
    const passwordHash = await bcrypt.hash(password, 10);
    const usersByLogin = {};

    for (const userData of demoUsers) {
        const user = await upsertUser(userData, passwordHash);
        usersByLogin[user.login] = user;
    }

    const creator = usersByLogin.manager || usersByLogin.director;
    let taskCount = 0;

    for (const projectData of demoProjects) {
        const project = await upsertByName(Project, projectData.name, {
            description: projectData.description,
            color: projectData.color,
            createdBy: creator.id
        });

        for (const boardData of projectData.boards) {
            const board = await upsertByName(Board, boardData.name, {
                description: boardData.description,
                color: boardData.color,
                projectId: project.id,
                createdBy: creator.id
            });

            for (const [title, description, status, assigneeLogin, deadlineOffset] of boardData.tasks) {
                await upsertTask({
                    title,
                    description,
                    status,
                    assignee: usersByLogin[assigneeLogin],
                    deadline: getDeadline(deadlineOffset),
                    boardId: board.id,
                    createdBy: creator.id
                });
                taskCount += 1;
            }
        }
    }

    console.log(`Demo data ready: ${demoUsers.length} users, ${demoProjects.length} projects, ${taskCount} tasks.`);
    console.log(`Demo password for all seeded users: ${password}`);
};
