import { fetch, Agent } from "undici"
import { Task, User } from "../models/associations.js"

const agent = new Agent({
  connect: { rejectUnauthorized: false }
})

let cachedToken = null
let tokenExpiry = 0

// Получение токена GigaChat
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

// Формирование контекста для AI
function buildContext(myTasks, createdTasks, allUsers, currentUser) {
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

  // Статистика моих задач
  context += `--- МОИ ЗАДАЧИ ---\n`
  context += `Всего назначено мне: ${myTasks.length}\n`
  context += `  • К выполнению (todo): ${stats.myTodo}\n`
  context += `  • В работе (inProgress): ${stats.myInProgress}\n`
  context += `  • Завершено (done): ${stats.myDone}\n\n`

  // Детали активных задач
  const activeTasks = myTasks.filter(t => t.status !== 'done').slice(0, 15)
  if (activeTasks.length > 0) {
    context += `АКТИВНЫЕ ЗАДАЧИ (не завершённые):\n`
    activeTasks.forEach((task, i) => {
      const deadline = task.deadline 
        ? `дедлайн ${new Date(task.deadline).toLocaleDateString('ru-RU')}` 
        : 'без дедлайна'
      const creator = task.creator?.fullName || task.creator?.login || 'неизвестен'
      const statusRu = task.status === 'todo' ? 'к выполнению' : 'в работе'
      
      context += `${i + 1}. "${task.title}"\n`
      context += `   Статус: ${statusRu} | ${deadline} | Создал: ${creator}\n`
      if (task.description) {
        context += `   Описание: ${task.description.substring(0, 100)}\n`
      }
    })
    context += `\n`
  } else if (myTasks.length === 0) {
    context += `У меня НЕТ назначенных задач.\n\n`
  }

  // Задачи созданные мной
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

    // Последние 10 созданных задач
    const recentCreated = createdTasks.slice(0, 10)
    context += `ПОСЛЕДНИЕ СОЗДАННЫЕ:\n`
    recentCreated.forEach((task, i) => {
      const assignee = task.assignee?.fullName || task.assignee?.login || 'НЕ НАЗНАЧЕНО'
      const statusRu = {
        todo: 'к выполнению',
        inProgress: 'в работе',
        done: 'завершено'
      }[task.status]
      
      context += `${i + 1}. "${task.title}" → исполнитель: ${assignee} (${statusRu})\n`
    })
    context += `\n`
  }

  // Список сотрудников (для админов)
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

// 🔥 AI с контекстом БД
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

    // Получаем данные из БД
    const myTasks = await Task.findAll({
      where: { assignedTo: userId },
      include: [
        { model: User, as: 'creator', attributes: ['fullName', 'login'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    })

    const createdTasks = await Task.findAll({
      where: { createdBy: userId },
      include: [
        { model: User, as: 'assignee', attributes: ['fullName', 'login'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    })

    let allUsers = []
    if (req.user.role === 'admin') {
      allUsers = await User.findAll({
        attributes: ['id', 'fullName', 'login', 'role'],
        order: [['fullName', 'ASC']]
      })
    }

    console.log("📊 Загружено: задач (мне) -", myTasks.length, "| созданных -", createdTasks.length, "| сотрудников -", allUsers.length)

    // Формируем контекст
    const context = buildContext(myTasks, createdTasks, allUsers, req.user)

    // Выводим контекст в консоль для отладки
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
            content: `Ты AI-помощник системы управления задачами. Твоя задача — помогать пользователю анализировать его задачи и данные.

СТРОГО используй ТОЛЬКО информацию из блока "ДАННЫЕ СИСТЕМЫ" ниже. НЕ выдумывай цифры, имена или задачи.

${context}

Правила ответов:
1. Используй ТОЛЬКО данные выше из блока "ДАННЫЕ СИСТЕМЫ"
2. Если данных нет — прямо скажи "У вас нет задач" или "Нет сотрудников"
3. Приводи конкретные числа и примеры из контекста
4. Отвечай чётко и структурированно
5. Используй эмодзи для наглядности

Примеры хороших ответов:
Вопрос: "Сколько у меня задач?"
Ответ: "📊 Всего назначено вам: 5 задач
• К выполнению: 3
• В работе: 2
• Завершено: 0"

Вопрос: "Перечисли активные задачи"
Ответ: "🎯 Ваши активные задачи:
1. 'Название задачи 1' - к выполнению, дедлайн 25.04.2026
2. 'Название задачи 2' - в работе, без дедлайна"

ВАЖНО: Не говори общими фразами. Используй конкретные названия задач, имена и числа из данных выше.

Отвечай на русском языке.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,  // Минимальная креативность
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

// Простой AI без контекста
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