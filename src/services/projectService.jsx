const API = "http://localhost:3000/api"

export const getProjects = async () => {
  const res = await fetch(`${API}/projects`, {
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка загрузки проектов")
  }

  return res.json()
}

export const createProject = async (projectData) => {
  const res = await fetch(`${API}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData),
    credentials: "include"
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Ошибка создания проекта")
  }

  return res.json()
}

export const updateProject = async (projectId, updates) => {
  const res = await fetch(`${API}/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
    credentials: "include"
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Ошибка обновления проекта")
  }

  return res.json()
}

export const deleteProject = async (projectId) => {
  const res = await fetch(`${API}/projects/${projectId}`, {
    method: "DELETE",
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка удаления проекта")
  }

  return res.json()
}

export const getProjectBoards = async (projectId) => {
  const res = await fetch(`${API}/projects/${projectId}/boards`, {
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка загрузки досок проекта")
  }

  return res.json()
}
