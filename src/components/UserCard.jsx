import { useEffect, useState } from "react"

export default function UserCard({ user, currentUser, onUpdateUser, onDeleteUser, onRoleChange }) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    login: user.login || "",
    phone: user.phone || ""
  })
  const [selectedRole, setSelectedRole] = useState(user.role)

  const canChangeRole = currentUser?.role === "superadmin"
  const hasUserChanges = (
    formData.fullName !== (user.fullName || "") ||
    formData.login !== (user.login || "") ||
    formData.phone !== (user.phone || "")
  )

  useEffect(() => {
    setFormData({
      fullName: user.fullName || "",
      login: user.login || "",
      phone: user.phone || ""
    })
    setSelectedRole(user.role)
  }, [user])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveUser = () => {
    if (!formData.fullName.trim() || !formData.login.trim() || !formData.phone.trim()) {
      alert("Заполните ФИО, логин и телефон")
      return
    }

    onUpdateUser(user.id, {
      fullName: formData.fullName.trim(),
      login: formData.login.trim(),
      phone: formData.phone.trim()
    })
  }

  const handleDelete = () => {
    const name = user.fullName || user.login

    if (window.confirm(`Удалить пользователя ${name}?`)) {
      onDeleteUser(user.id)
    }
  }

  const handleRoleChange = () => {
    const name = user.fullName || user.login

    if (window.confirm(`Изменить роль пользователя ${name} на ${getRoleName(selectedRole)}?`)) {
      onRoleChange(user.id, selectedRole)
    }
  }

  const getRoleName = (role) => {
    const roleNames = {
      superadmin: "Супер-админ",
      manager: "Менеджер",
      user: "Пользователь"
    }

    return roleNames[role] || role
  }

  const getRoleClass = (role) => `user-role role-${role}`

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">
          {(user.fullName || user.login || "?").charAt(0).toUpperCase()}
        </div>

        <div>
          <h3>{user.fullName || user.login}</h3>
          <p className={getRoleClass(user.role)}>{getRoleName(user.role)}</p>
        </div>
      </div>

      <div className="user-edit-form">
        <label>
          ФИО
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="ФИО"
          />
        </label>

        <label>
          Логин
          <input
            name="login"
            value={formData.login}
            onChange={handleChange}
            placeholder="Логин"
          />
        </label>

        <label>
          Телефон
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Телефон"
          />
        </label>
      </div>

      {canChangeRole && (
        <div className="user-role-editor">
          <label>
            Роль
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
            >
              <option value="user">Пользователь</option>
              <option value="manager">Менеджер</option>
              <option value="superadmin">Супер-админ</option>
            </select>
          </label>

          {selectedRole !== user.role && (
            <button type="button" onClick={handleRoleChange} className="btn-change-role">
              Сохранить роль
            </button>
          )}
        </div>
      )}

      <div className="user-card-actions">
        <button type="button" onClick={handleSaveUser} disabled={!hasUserChanges}>
          Сохранить данные
        </button>

        <button type="button" onClick={handleDelete} className="btn-delete-user">
          Удалить
        </button>
      </div>
    </div>
  )
}
