const API = "http://localhost:3000/api"

// Простой запрос без контекста
export const askAI = async (message) => {
  const res = await fetch(`${API}/ai/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    credentials: "include"
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "Ошибка AI")
  }

  const data = await res.json()
  return data.reply
}

// 🔥 Запрос с контекстом БД
export const askAIWithContext = async (message) => {
  const res = await fetch(`${API}/ai/ask-context`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    credentials: "include"
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "Ошибка AI")
  }

  const data = await res.json()
  return data.reply
}
