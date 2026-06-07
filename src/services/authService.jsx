import { API } from "./apiConfig"

export const register = async (userData) => {
  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      credentials: "include"
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || "Ошибка регистрации")
    }

    return data
  } catch (error) {
    // Если это ошибка сети
    if (error.message === "Failed to fetch") {
      throw new Error("Не удалось подключиться к серверу. Проверьте адрес API и доступность backend-сервера.")
    }
    throw error
  }
}

export const login = async (credentials) => {
  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include"
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || "Ошибка авторизации")
    }

    return data
  } catch (error) {
    if (error.message === "Failed to fetch") {
      throw new Error("Не удалось подключиться к серверу. Проверьте адрес API и доступность backend-сервера.")
    }
    throw error
  }
}

export const logout = async () => {
  const res = await fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include"
  })

  if (!res.ok) {
    throw new Error("Ошибка выхода")
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

export const updateProfile = async (profileData) => {
  const res = await fetch(`${API}/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
    credentials: "include"
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || "Ошибка обновления профиля")
  }

  return data
}
