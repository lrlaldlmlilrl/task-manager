import LoginForm from "../components/LoginForm"

export default function LoginPage({ onLoginSuccess }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>TaskManager</h1>
        <p className="auth-subtitle">Система управления задачами</p>
        <h2>Вход в систему</h2>
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  )
}
