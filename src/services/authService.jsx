const API = "http://localhost:3000/api"

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
      throw new Error("Не удалось подключиться к серверу. Убедитесь, что сервер запущен на http://localhost:3000")
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
      throw new Error("Не удалось подключиться к серверу. Убедитесь, что сервер запущен на http://localhost:3000")
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
