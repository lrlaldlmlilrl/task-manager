import { useNavigate } from "react-router-dom"

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    if (window.confirm("Вы уверены, что хотите выйти?")) {
      onLogout()
      navigate("/login")
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        <h2>SoftAlert</h2>
        
        <button onClick={() => navigate("/home")}>
          Главная
        </button>

        <button onClick={() => navigate("/dashboard")}>
          Канбан
        </button>

        <button onClick={() => navigate("/calendar")}>
          Календарь
        </button>

        {(user.role === "superadmin" || user.role === "manager") && (
          <button onClick={() => navigate("/admin")}>
            Админ панель
          </button>
        )}

        {user.role === "superadmin" && (
          <button onClick={() => navigate("/company")}>
            Статистика
          </button>
        )}

        <button onClick={() => navigate("/profile")}>
          Профиль
        </button>

        <button onClick={() => navigate("/ai-assistant")}>
          AI Помощник
        </button>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}
