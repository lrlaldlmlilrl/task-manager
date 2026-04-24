import { useState, useRef, useEffect } from "react"
import { askAI } from "../services/aiService"

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Привет! Я AI-помощник. Чем могу помочь с задачами?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Автоскролл вниз
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: "user", text: userMsg }])
    setInput("")
    setLoading(true)

    try {
      const reply = await askAI(userMsg)
      setMessages(prev => [...prev, { role: "ai", text: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "Произошла ошибка. Попробуйте позже." 
      }])
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

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <span>GigaChat Ассистент</span>
      </div>

      <div className="ai-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-message ${msg.role}`}>
            <div className="ai-message-bubble">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-message ai">
            <div className="ai-message-bubble ai-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ai-chat-input">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение... (Enter — отправить)"
          rows={2}
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()}>
          {loading ? "..." : "Отправить"}
        </button>
      </div>
    </div>
  )
}
