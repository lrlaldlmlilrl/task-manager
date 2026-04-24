const API = "http://localhost:3000/api"

export const getUsers = async () => {
  const res = await fetch(`${API}/users`, {
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка загрузки пользователей")
  }

  return res.json()
}

export const updateUserRole = async (userId, role) => {
  const res = await fetch(`${API}/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
    credentials: "include"
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || "Ошибка обновления роли")
  }

  return res.json()
}

export const getProfile = async () => {
  const res = await fetch(`${API}/profile`, {
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Не авторизован")
  }

  return res.json()
}
