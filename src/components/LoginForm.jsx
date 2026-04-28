import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/authService'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(formData)
      navigate("/home", { replace: true })
    } catch (err) {
      setError(err.message || "Ошибка авторизации")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    setFormData(prev => ({
      ...prev,
      [event.target.name]: event.target.value 
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      
      <input
        type="text"
        name="login"
        placeholder="Логин"
        value={formData.login}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <div className="passwordWrapper">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <button
          className="passwordButton"
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "Скрыть" : "Показать"}
        </button>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Вход..." : "Войти"}
      </button>
      <p>
        Нет аккаунта? <Link to="/register">Регистрация</Link>
      </p>
    </form>
  )
}
