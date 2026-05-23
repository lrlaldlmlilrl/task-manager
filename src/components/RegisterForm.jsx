import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register } from "../services/authService"
import { getFieldError } from "../utils/profileValidation"

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    fullName: "",
    phone: "",
    role: "user"
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({
    login: "",
    password: "",
    fullName: "",
    phone: ""
  })

  const navigate = useNavigate()

  const validateField = (fieldName, value) => {
    const fieldError = getFieldError(fieldName, value)
    setErrors((prev) => ({ ...prev, [fieldName]: fieldError }))
    return fieldError
  }

  const validateAll = () => {
    const nextErrors = {
      login: getFieldError("login", formData.login),
      password: getFieldError("password", formData.password),
      fullName: getFieldError("fullName", formData.fullName),
      phone: getFieldError("phone", formData.phone)
    }

    setErrors(nextErrors)

    const hasEmptyFields = ["login", "password", "fullName", "phone"].some(
      (key) => !formData[key].trim()
    )
    const hasErrors = Object.values(nextErrors).some((value) => value !== "")

    return !(hasEmptyFields || hasErrors)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateAll()) {
      setError("Заполните все поля корректно")
      return
    }

    setError("")
    setLoading(true)

    try {
      await register(formData)
      navigate("/login", { replace: true })
    } catch (err) {
      setError(err?.message || "Ошибка регистрации")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p className="error">{error}</p>}

      {errors.login && <span className="error">{errors.login}</span>}
      <input
        type="text"
        name="login"
        placeholder="Логин"
        value={formData.login}
        onChange={handleChange}
        required
        disabled={loading}
      />

      {errors.password && <span className="error">{errors.password}</span>}
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

      {errors.fullName && <span className="error">{errors.fullName}</span>}
      <input
        type="text"
        name="fullName"
        placeholder="ФИО"
        value={formData.fullName}
        onChange={handleChange}
        required
        disabled={loading}
      />

      {errors.phone && <span className="error">{errors.phone}</span>}
      <input
        type="tel"
        name="phone"
        placeholder="89010973385"
        value={formData.phone}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Регистрация..." : "Зарегистрироваться"}
      </button>

      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </form>
  )
}
