const API = "http://localhost:3000/api"

export const getBoards = async () => {
  const res = await fetch(`${API}/boards`, {
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка загрузки досок")
  }

  return res.json()
}

export const createBoard = async (boardData) => {
  const res = await fetch(`${API}/boards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(boardData),
    credentials: "include"
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Ошибка создания доски")
  }

  return res.json()
}

export const updateBoard = async (boardId, updates) => {
  const res = await fetch(`${API}/boards/${boardId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
    credentials: "include"
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Ошибка обновления доски")
  }

  return res.json()
}

export const deleteBoard = async (boardId) => {
  const res = await fetch(`${API}/boards/${boardId}`, {
    method: "DELETE",
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка удаления доски")
  }

  return res.json()
}

export const getBoardTasks = async (boardId) => {
  const res = await fetch(`${API}/boards/${boardId}/tasks`, {
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка загрузки задач доски")
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
