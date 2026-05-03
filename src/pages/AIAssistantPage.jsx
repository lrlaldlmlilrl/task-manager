import { useEffect, useRef, useState } from "react"
import Sidebar from "../components/SideBar"
import { askAIWithContext } from "../services/aiService"

export default function AIAssistantPage({ user, onLogout }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Привет, ${user.fullName || user.login}!\n\nЯ твой AI-помощник. Могу помочь с:\n\nАнализом твоих задач\nПланированием времени\nРасстановкой приоритетов\nСтатистикой по проектам\n\nЗадай мне вопрос!`
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const send = async () => {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setMessages((prev) => [...prev, { role: "user", text: userMsg }])
    setInput("")
    setLoading(true)

    try {
      const reply = await askAIWithContext(userMsg)
      setMessages((prev) => [...prev, { role: "ai", text: reply }])
    } catch (err) {
      console.error("Ошибка AI:", err)
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Произошла ошибка. Попробуйте позже или переформулируйте вопрос."
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const quickQuestions = [
    "Покажи статистику по моим задачам",
    "Какие задачи горят по срокам?",
    "Что мне делать в первую очередь?",
    "Как идут дела по проектам?"
  ]

  const askQuick = (question) => {
    setInput(question)
  }

  return (
    <div className="layout">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="ai-assistant-page">
        <div className="ai-header">
          <div className="ai-header-icon"></div>
          <div>
            <h1>AI Ассистент</h1>
            <p>Умный помощник с доступом к вашим задачам и данным</p>
          </div>
        </div>

        <div className="ai-chat-container">
          <div className="ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-message ${msg.role}`}>
                <div className="ai-message-bubble">
                  {msg.text.split("\n").map((line, j) => (
                    <div key={j}>{line || <br />}</div>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message ai">
                <div className="ai-message-bubble ai-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className={`quick-questions ${messages.length === 1 ? "" : "is-hidden"}`}>
            <p>Быстрые вопросы:</p>
            <div className="quick-btns">
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => askQuick(q)} className="quick-btn">
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-input-container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите вопрос... (Enter — отправить, Shift+Enter — новая строка)"
              rows={3}
              disabled={loading}
            />
            <button onClick={send} disabled={loading || !input.trim()}>
              {loading ? "Загрузка" : "Отправить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
