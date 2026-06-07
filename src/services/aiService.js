import { API } from "./apiConfig"

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
