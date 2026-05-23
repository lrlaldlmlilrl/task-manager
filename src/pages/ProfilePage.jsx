import { useEffect, useState } from "react"
import Sidebar from "../components/SideBar"
import { updateProfile } from "../services/authService"
import { getFieldError } from "../utils/profileValidation"
import "../styles/profile.css"

export default function ProfilePage({ user, onUserUpdate, onLogout }) {
  const [formData, setFormData] = useState({
    login: "",
    fullName: "",
    phone: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({
    login: "",
    fullName: "",
    phone: ""
  })

  useEffect(() => {
    if (!user) return

    setFormData({
      login: user.login || "",
      fullName: user.fullName || "",
      phone: user.phone || ""
    })
    setErrors({
      login: "",
      fullName: "",
      phone: ""
    })
  }, [user])

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Загрузка...
      </div>
    )
  }

  const getRoleName = (role) => {
    const roleNames = {
      superadmin: "Супер-администратор",
      manager: "Менеджер",
      user: "Пользователь"
    }
    return roleNames[role] || "Пользователь"
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setErrors((prev) => ({
      ...prev,
      [name]: getFieldError(name, value)
    }))
    setError("")
    setSuccess("")
  }

  const handleCancel = () => {
    setFormData({
      login: user.login || "",
      fullName: user.fullName || "",
      phone: user.phone || ""
    })
    setError("")
    setSuccess("")
    setErrors({
      login: "",
      fullName: "",
      phone: ""
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    const nextErrors = {
      login: getFieldError("login", formData.login),
      fullName: getFieldError("fullName", formData.fullName),
      phone: getFieldError("phone", formData.phone)
    }
    setErrors(nextErrors)

    const hasEmptyFields = ["login", "fullName", "phone"].some((key) => !formData[key].trim())
    const hasErrors = Object.values(nextErrors).some((value) => value !== "")
    if (hasEmptyFields || hasErrors) {
      setError("Заполните все поля корректно")
      return
    }

    setIsSaving(true)

    try {
      const updatedUser = await updateProfile(formData)
      onUserUpdate?.(updatedUser)
      setSuccess("Данные профиля обновлены")
    } catch (err) {
      setError(err.message || "Не удалось обновить профиль")
    } finally {
      setIsSaving(false)
    }
  }

  const isChanged =
    formData.login !== (user.login || "") ||
    formData.fullName !== (user.fullName || "") ||
    formData.phone !== (user.phone || "")

  return (
    <div className="layout">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="main">
        <div className="profile-page">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#2563EB" />
                  <path
                    d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
                    fill="#2563EB"
                  />
                </svg>
              </div>

              <div>
                <h2>{user.fullName || user.login}</h2>
                <p className="role">{getRoleName(user.role)}</p>
              </div>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              {error && <div className="profile-message profile-message-error">{error}</div>}
              {success && <div className="profile-message profile-message-success">{success}</div>}

              <div className="profile-field">
                <label htmlFor="login">Логин</label>
                {errors.login && <span className="profile-field-error">{errors.login}</span>}
                <input
                  id="login"
                  name="login"
                  type="text"
                  value={formData.login}
                  onChange={handleChange}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="fullName">Имя</label>
                {errors.fullName && <span className="profile-field-error">{errors.fullName}</span>}
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="phone">Телефон</label>
                {errors.phone && <span className="profile-field-error">{errors.phone}</span>}
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="info-row">
                <span>Роль</span>
                <span>{getRoleName(user.role)}</span>
              </div>

              {user.createdAt && (
                <div className="info-row">
                  <span>Дата регистрации</span>
                  <span>{new Date(user.createdAt).toLocaleDateString("ru-RU")}</span>
                </div>
              )}

              <div className="profile-actions">
                <button type="button" className="profile-secondary-btn" onClick={handleCancel} disabled={isSaving || !isChanged}>
                  Отменить
                </button>
                <button type="submit" className="profile-primary-btn" disabled={isSaving || !isChanged}>
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
