const API = "http://localhost:3000/api"

export const getTasks = async () => {
  const res = await fetch(`${API}/tasks`, {
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка загрузки задач")
  }

  const data = await res.json()
  
  // Преобразуем данные с сервера в формат клиента
  return data.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    deadline: task.deadline,
    assignedTo: task.assignee?.fullName || task.assignee?.login,
    assignedToId: task.assignedTo,
    createdBy: task.creator?.fullName || task.creator?.login,
    boardId: task.boardId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  }))
}

export const createTask = async (taskData) => {
  const res = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка создания задачи")
  }

  const task = await res.json()
  
  // Преобразуем данные
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    deadline: task.deadline,
    assignedTo: task.assignee?.fullName || task.assignee?.login,
    assignedToId: task.assignedTo,
    createdBy: task.creator?.fullName || task.creator?.login,
    boardId: task.boardId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  }
}

export const updateTask = async (taskId, taskData) => {
  const res = await fetch(`${API}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка обновления задачи")
  }

  const task = await res.json()
  
  // Преобразуем данные
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    deadline: task.deadline,
    assignedTo: task.assignee?.fullName || task.assignee?.login,
    assignedToId: task.assignedTo,
    createdBy: task.creator?.fullName || task.creator?.login,
    boardId: task.boardId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  }
}

export const deleteTask = async (taskId) => {
  const res = await fetch(`${API}/tasks/${taskId}`, {
    method: "DELETE",
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка удаления задачи")
  }

  return res.json()
}
