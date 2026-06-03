import { fetch, Agent } from "undici"
import { Task, User, Board, Project } from "../models/associations.js"

const agent = new Agent({
  connect: { rejectUnauthorized: false }
})

let cachedToken = null
let tokenExpiry = 0

const getGigaChatToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const res = await fetch("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "RqUID": crypto.randomUUID(),
      "Authorization": `Basic ${process.env.GIGACHAT_AUTH_KEY}`
    },
    body: `scope=${process.env.GIGACHAT_SCOPE || "GIGACHAT_API_PERS"}`,
    dispatcher: agent
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Ошибка токена (${res.status}): ${err}`)
  }

  const data = await res.json()

  if (!data.access_token) {
    throw new Error(`Токен не получен: ${JSON.stringify(data)}`)
  }

  cachedToken = data.access_token
  tokenExpiry = Date.now() + (25 * 60 * 1000)

  return cachedToken
}

const isManagementRole = (role) => role === 'manager' || role === 'superadmin'

const getRoleName = (role) => {
  const roles = {
    superadmin: 'супер-администратор',
    manager: 'менеджер',
    user: 'сотрудник'
  }

  return roles[role] || role
}

const getStatusName = (status) => {
  const statuses = {
    todo: 'к выполнению',
    inProgress: 'в работе',
    done: 'выполнено'
  }

  return statuses[status] || status
}

const isOverdueTask = (task) => {
  if (!task.deadline || task.status === 'done') return false
  return new Date(task.deadline) < new Date()
}

function buildManagementContext(allTasks, allUsers, currentUser, allProjects, allBoards) {
  const totalTodo = allTasks.filter(t => t.status === 'todo').length
  const totalInProgress = allTasks.filter(t => t.status === 'inProgress').length
  const totalDone = allTasks.filter(t => t.status === 'done').length
  const overdueTasks = allTasks.filter(isOverdueTask)

  let context = `=== ДАННЫЕ СИСТЕМЫ ===\n\n`

  context += `ПОЛЬЗОВАТЕЛЬ: ${currentUser.fullName || currentUser.login}\n`
  context += `РОЛЬ: ${getRoleName(currentUser.role)}\n`
  context += `ВАЖНО: AI общается с ${getRoleName(currentUser.role)}. Отвечай как управленческий помощник: анализируй сотрудников, задачи, дедлайны, просрочки, проекты и доски. Можно давать рекомендации по контролю выполнения и перераспределению нагрузки, но не выдумывай данные.\n\n`

  context += `--- ОБЩАЯ СТАТИСТИКА ПО ЗАДАЧАМ ---\n`
  context += `Всего задач: ${allTasks.length}\n`
  context += `  • К выполнению: ${totalTodo}\n`
  context += `  • В работе: ${totalInProgress}\n`
  context += `  • Выполнено: ${totalDone}\n`
  context += `  • Просрочено: ${overdueTasks.length}\n\n`

  if (allUsers.length > 0) {
    context += `--- СОТРУДНИКИ И ИХ ПОКАЗАТЕЛИ ---\n`
    allUsers.forEach((employee, index) => {
      const employeeTasks = allTasks.filter(task => task.assignedTo === employee.id)
      const employeeTodo = employeeTasks.filter(task => task.status === 'todo').length
      const employeeInProgress = employeeTasks.filter(task => task.status === 'inProgress').length
      const employeeDone = employeeTasks.filter(task => task.status === 'done').length
      const employeeOverdue = employeeTasks.filter(isOverdueTask).length

      context += `${index + 1}. ${employee.fullName || employee.login} (${getRoleName(employee.role)})\n`
      context += `   Всего задач: ${employeeTasks.length} | к выполнению: ${employeeTodo} | в работе: ${employeeInProgress} | выполнено: ${employeeDone} | просрочено: ${employeeOverdue}\n`
    })
    context += `\n`
  }

  if (overdueTasks.length > 0) {
    context += `--- ПРОСРОЧЕННЫЕ ЗАДАЧИ ---\n`
    overdueTasks.slice(0, 30).forEach((task, index) => {
      const assignee = task.assignee?.fullName || task.assignee?.login || 'не назначено'
      const boardName = task.board?.name || 'без доски'
      const projectName = task.board?.project?.name || 'без проекта'
      const deadline = new Date(task.deadline).toLocaleDateString('ru-RU')

      context += `${index + 1}. "${task.title}" | исполнитель: ${assignee} | дедлайн: ${deadline} | проект: ${projectName} | доска: ${boardName}\n`
    })
    context += `\n`
  }

  if (allTasks.length > 0) {
    context += `--- ВСЕ ЗАДАЧИ ---\n`
    allTasks.slice(0, 80).forEach((task, index) => {
      const assignee = task.assignee?.fullName || task.assignee?.login || 'не назначено'
      const creator = task.creator?.fullName || task.creator?.login || 'неизвестно'
      const boardName = task.board?.name || 'без доски'
      const projectName = task.board?.project?.name || 'без проекта'
      const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString('ru-RU') : 'без дедлайна'
      const overdueMark = isOverdueTask(task) ? ' | ПРОСРОЧЕНО' : ''

      context += `${index + 1}. "${task.title}"\n`
      context += `   Статус: ${getStatusName(task.status)}${overdueMark} | исполнитель: ${assignee} | создал: ${creator} | дедлайн: ${deadline}\n`
      context += `   Проект: ${projectName} | доска: ${boardName}\n`
      if (task.description) {
        context += `   Описание: ${task.description.substring(0, 120)}\n`
      }
    })
    if (allTasks.length > 80) {
      context += `Показаны первые 80 задач из ${allTasks.length}. Для общей аналитики используй статистику выше.\n`
    }
    context += `\n`
  }

  if (allProjects.length > 0) {
    context += `--- ПРОЕКТЫ ---\n`
    allProjects.forEach((project, index) => {
      const projectBoards = allBoards.filter(board => board.projectId === project.id)
      const projectTasks = allTasks.filter(task => task.board?.projectId === project.id)
      const projectOverdue = projectTasks.filter(isOverdueTask).length

      context += `${index + 1}. "${project.name}" | досок: ${projectBoards.length} | задач: ${projectTasks.length} | просрочено: ${projectOverdue}\n`
      if (projectBoards.length > 0) {
        context += `   Доски: ${projectBoards.map(board => `"${board.name}"`).join(', ')}\n`
      }
    })
    context += `\n`
  } else {
    context += `--- ПРОЕКТЫ ---\nПроектов нет.\n\n`
  }

  if (allBoards.length > 0) {
    context += `--- ДОСКИ ---\n`
    allBoards.forEach((board, index) => {
      const boardTasks = allTasks.filter(task => task.boardId === board.id)
      const boardTodo = boardTasks.filter(task => task.status === 'todo').length
      const boardInProgress = boardTasks.filter(task => task.status === 'inProgress').length
      const boardDone = boardTasks.filter(task => task.status === 'done').length
      const boardOverdue = boardTasks.filter(isOverdueTask).length
      const projectName = board.project?.name || 'без проекта'

      context += `${index + 1}. "${board.name}" | проект: ${projectName} | задач: ${boardTasks.length} | к выполнению: ${boardTodo} | в работе: ${boardInProgress} | выполнено: ${boardDone} | просрочено: ${boardOverdue}\n`
    })
    context += `\n`
  } else {
    context += `--- ДОСКИ ---\nДосок нет.\n\n`
  }

  context += `=== КОНЕЦ ДАННЫХ ===\n`

  return context
}

function buildContext(myTasks, createdTasks, allUsers, currentUser, allProjects, allBoards) {
  const stats = {
    myTodo: myTasks.filter(t => t.status === 'todo').length,
    myInProgress: myTasks.filter(t => t.status === 'inProgress').length,
    myDone: myTasks.filter(t => t.status === 'done').length,
    createdTotal: createdTasks.length,
    totalUsers: allUsers.length
  }

  let context = `=== ДАННЫЕ СИСТЕМЫ ===\n\n`

  context += `ПОЛЬЗОВАТЕЛЬ: ${currentUser.fullName || currentUser.login}\n`
  context += `РОЛЬ: ${currentUser.role === 'admin' ? 'Администратор' : 'Сотрудник'}\n\n`

  context += `--- МОИ ЗАДАЧИ ---\n`
  context += `Всего назначено мне: ${myTasks.length}\n`
  context += `  • К выполнению (todo): ${stats.myTodo}\n`
  context += `  • В работе (inProgress): ${stats.myInProgress}\n`
  context += `  • Завершено (done): ${stats.myDone}\n\n`

  const activeTasks = myTasks.filter(t => t.status !== 'done').slice(0, 15)
  if (activeTasks.length > 0) {
    context += `АКТИВНЫЕ ЗАДАЧИ (не завершённые):\n`
    activeTasks.forEach((task, i) => {
      const deadline = task.deadline
        ? `дедлайн ${new Date(task.deadline).toLocaleDateString('ru-RU')}`
        : 'без дедлайна'
      const creator = task.creator?.fullName || task.creator?.login || 'неизвестен'
      const statusRu = task.status === 'todo' ? 'к выполнению' : 'в работе'
      const boardName = task.board?.name || 'без доски'

      context += `${i + 1}. "${task.title}"\n`
      context += `   Статус: ${statusRu} | ${deadline} | Создал: ${creator} | Доска: ${boardName}\n`
      if (task.description) {
        context += `   Описание: ${task.description.substring(0, 100)}\n`
      }
    })
    context += `\n`
  } else if (myTasks.length === 0) {
    context += `У меня НЕТ назначенных задач.\n\n`
  }

  if (createdTasks.length > 0) {
    context += `--- ЗАДАЧИ СОЗДАННЫЕ МНОЙ ---\n`
    context += `Всего создано: ${createdTasks.length}\n`

    const createdByStatus = {
      todo: createdTasks.filter(t => t.status === 'todo').length,
      inProgress: createdTasks.filter(t => t.status === 'inProgress').length,
      done: createdTasks.filter(t => t.status === 'done').length
    }

    context += `  • К выполнению: ${createdByStatus.todo}\n`
    context += `  • В работе: ${createdByStatus.inProgress}\n`
    context += `  • Завершено: ${createdByStatus.done}\n\n`

    const recentCreated = createdTasks.slice(0, 10)
    context += `ПОСЛЕДНИЕ СОЗДАННЫЕ:\n`
    recentCreated.forEach((task, i) => {
      const assignee = task.assignee?.fullName || task.assignee?.login || 'НЕ НАЗНАЧЕНО'
      const boardName = task.board?.name || 'без доски'
      const statusRu = {
        todo: 'к выполнению',
        inProgress: 'в работе',
        done: 'завершено'
      }[task.status]

      context += `${i + 1}. "${task.title}" → исполнитель: ${assignee} (${statusRu}) | Доска: ${boardName}\n`
    })
    context += `\n`
  }

  if (allProjects.length > 0) {
    context += `--- ПРОЕКТЫ КОМПАНИИ ---\n`
    context += `Всего проектов: ${allProjects.length}\n\n`

    allProjects.forEach((project, i) => {
      const creator = project.creator?.fullName || project.creator?.login || 'неизвестен'
      const boardsInProject = allBoards.filter(b => b.projectId === project.id)

      context += `${i + 1}. "${project.name}"\n`
      context += `   Создал: ${creator} | Досок в проекте: ${boardsInProject.length}\n`
      if (project.description) {
        context += `   Описание: ${project.description.substring(0, 100)}\n`
      }
      if (boardsInProject.length > 0) {
        context += `   Доски: ${boardsInProject.map(b => `"${b.name}"`).join(', ')}\n`
      }
    })
    context += `\n`
  } else {
    context += `--- ПРОЕКТЫ КОМПАНИИ ---\nПроектов нет.\n\n`
  }

  if (allBoards.length > 0) {
    context += `--- ДОСКИ КОМПАНИИ ---\n`
    context += `Всего досок: ${allBoards.length}\n\n`

    allBoards.forEach((board, i) => {
      const creator = board.creator?.fullName || board.creator?.login || 'неизвестен'
      const projectName = board.project?.name || 'без проекта'
      const tasksOnBoard = board.tasks?.length ?? 0
      const doneTasks = board.tasks?.filter(t => t.status === 'done').length ?? 0
      const inProgressTasks = board.tasks?.filter(t => t.status === 'inProgress').length ?? 0
      const todoTasks = board.tasks?.filter(t => t.status === 'todo').length ?? 0

      context += `${i + 1}. "${board.name}"\n`
      context += `   Создал: ${creator} | Проект: ${projectName}\n`
      context += `   Задач: ${tasksOnBoard} (к выполнению: ${todoTasks}, в работе: ${inProgressTasks}, завершено: ${doneTasks})\n`
      if (board.description) {
        context += `   Описание: ${board.description.substring(0, 100)}\n`
      }
    })
    context += `\n`
  } else {
    context += `--- ДОСКИ КОМПАНИИ ---\nДосок нет.\n\n`
  }

  if (allUsers.length > 0) {
    context += `--- СОТРУДНИКИ КОМПАНИИ ---\n`
    context += `Всего сотрудников: ${allUsers.length}\n\n`

    const admins = allUsers.filter(u => u.role === 'admin')
    const employees = allUsers.filter(u => u.role !== 'admin')

    if (admins.length > 0) {
      context += `Администраторы (${admins.length}):\n`
      admins.forEach(u => {
        context += `  • ${u.fullName || u.login}\n`
      })
      context += `\n`
    }

    if (employees.length > 0) {
      context += `Сотрудники (${employees.length}):\n`
      employees.forEach(u => {
        context += `  • ${u.fullName || u.login}\n`
      })
      context += `\n`
    }
  }

  context += `=== КОНЕЦ ДАННЫХ ===\n`

  return context
}

export const askAIWithContext = async (req, res) => {
  try {
    const { message } = req.body
    const userId = req.user.id

    if (!message?.trim()) {
      return res.status(400).json({ message: "Сообщение не может быть пустым" })
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📨 AI запрос:", message)
    console.log("👤 От:", req.user.fullName || req.user.login)

    const myTasks = await Task.findAll({
      where: { assignedTo: userId },
      include: [
        { model: User, as: 'creator', attributes: ['fullName', 'login'] },
        { model: Board, as: 'board', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    })

    const createdTasks = await Task.findAll({
      where: { createdBy: userId },
      include: [
        { model: User, as: 'assignee', attributes: ['fullName', 'login'] },
        { model: Board, as: 'board', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    })

    const allProjects = await Project.findAll({
      include: [
        { model: User, as: 'creator', attributes: ['fullName', 'login'] }
      ],
      order: [['createdAt', 'DESC']]
    })

    const allBoards = await Board.findAll({
      include: [
        { model: User, as: 'creator', attributes: ['fullName', 'login'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: Task, as: 'tasks', attributes: ['id', 'status'] }
      ],
      order: [['createdAt', 'DESC']]
    })

    let allUsers = []
    if (isManagementRole(req.user.role)) {
      allUsers = await User.findAll({
        attributes: ['id', 'fullName', 'login', 'role'],
        order: [['fullName', 'ASC']]
      })
    }

    const allTasks = isManagementRole(req.user.role)
      ? await Task.findAll({
          include: [
            { model: User, as: 'assignee', attributes: ['id', 'fullName', 'login'] },
            { model: User, as: 'creator', attributes: ['id', 'fullName', 'login'] },
            {
              model: Board,
              as: 'board',
              attributes: ['id', 'name', 'projectId'],
              include: [
                { model: Project, as: 'project', attributes: ['id', 'name'] }
              ]
            }
          ],
          order: [['createdAt', 'DESC']]
        })
      : []

    console.log("📊 Загружено: задач (мне) -", myTasks.length, "| созданных -", createdTasks.length, "| проектов -", allProjects.length, "| досок -", allBoards.length, "| сотрудников -", allUsers.length)

    const context = isManagementRole(req.user.role)
      ? buildManagementContext(allTasks, allUsers, req.user, allProjects, allBoards)
      : buildContext(myTasks, createdTasks, allUsers, req.user, allProjects, allBoards)
    const roleInstruction = isManagementRole(req.user.role)
      ? `Ты общаешься с ${getRoleName(req.user.role)}. Отвечай как управленческий помощник: помогай контролировать сотрудников, показывай кто выполнил задачи, кто просрочил дедлайны, где есть перегрузка, какие проекты и доски требуют внимания.`
      : `Ты общаешься с сотрудником. Помогай ему анализировать его личные задачи, дедлайны, доски и проекты.`

    console.log("\n📋 КОНТЕКСТ ДЛЯ AI:\n", context, "\n")

    const token = await getGigaChatToken()

    const response = await fetch("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        model: "GigaChat",
        messages: [
          {
            role: "system",
            content: `Ты AI-помощник системы управления задачами. Твоя задача — помогать пользователю анализировать его задачи, доски и проекты.

СТРОГО используй ТОЛЬКО информацию из блока "ДАННЫЕ СИСТЕМЫ" ниже. НЕ выдумывай цифры, имена, задачи, доски или проекты.

${roleInstruction}

${context}

Правила ответов:
1. Используй ТОЛЬКО данные выше из блока "ДАННЫЕ СИСТЕМЫ"
2. Если данных нет — прямо скажи "У вас нет задач", "Нет досок" или "Нет проектов"
3. Приводи конкретные числа и примеры из контекста
4. Отвечай чётко и структурированно


Примеры хороших ответов:
Вопрос: "Сколько у меня задач?"
Ответ: "📊 Всего назначено вам: 5 задач
• К выполнению: 3
• В работе: 2
• Завершено: 0"

Вопрос: "Какие есть проекты?"
Ответ: "📁 Проекты компании (2):
1. 'Название проекта 1' — 3 доски
2. 'Название проекта 2' — 1 доска"

Вопрос: "Покажи доски"
Ответ: "🗂 Доски компании (3):
1. 'Доска 1' — проект: 'Проект А', задач: 5 (в работе: 2, завершено: 3)
2. 'Доска 2' — без проекта, задач: 0"

ВАЖНО: Не говори общими фразами. Используй конкретные названия задач, досок, проектов, имена и числа из данных выше.

Отвечай на русском языке.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        top_p: 0.85
      }),
      dispatcher: agent
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`GigaChat API (${response.status}): ${err}`)
    }

    const data = await response.json()
    const reply = data.choices[0].message.content

    console.log("✅ Ответ отправлен")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━\n")

    res.json({ reply })

  } catch (error) {
    console.error("❌ Ошибка AI:", error.message)
    console.error("Stack:", error.stack)
    res.status(500).json({
      message: "Ошибка AI",
      detail: error.message
    })
  }
}

export const askAI = async (req, res) => {
  try {
    const { message } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ message: "Сообщение не может быть пустым" })
    }

    const token = await getGigaChatToken()

    const response = await fetch("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        model: "GigaChat",
        messages: [
          {
            role: "system",
            content: "Ты помощник в корпоративной системе управления задачами. Отвечай кратко и по делу на русском языке."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
      dispatcher: agent
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`GigaChat API (${response.status}): ${err}`)
    }

    const data = await response.json()
    const reply = data.choices[0].message.content

    res.json({ reply })

  } catch (error) {
    console.error("❌ Ошибка AI:", error.message)
    res.status(500).json({
      message: "Ошибка AI",
      detail: error.message
    })
  }
}
