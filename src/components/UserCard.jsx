import { useState } from "react"

export default function UserCard({ user, currentUser, onAssignTask, onRoleChange }) {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    deadline: ""
  })
  const [selectedRole, setSelectedRole] = useState(user.role)

  const canChangeRole = currentUser && currentUser.role === "superadmin"
  const canAssignTask = currentUser && (currentUser.role === "superadmin" || currentUser.role === "manager")

  const handleAssign = () => {
    if (!taskData.title.trim()) {
      alert("Введите название задачи")
      return
    }

    onAssignTask({
      ...taskData,
      assignedTo: user.id  
    })

    setTaskData({
      title: "",
      description: "",
      deadline: ""
    })
  }

  const handleRoleChange = () => {
    if (window.confirm(`Изменить роль пользователя ${user.fullName} на ${getRoleName(selectedRole)}?`)) {
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

  const getRoleClass = (role) => {
    return `user-role role-${role}`
  }

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">
          {(user.fullName || user.name || user.login).charAt(0).toUpperCase()}
        </div>
        <div>
          <h3>{user.fullName || user.name || user.login}</h3>
          <p className={getRoleClass(user.role)}>
            {getRoleName(user.role)}
          </p>
        </div>
      </div>

      {canChangeRole && (
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
            Изменить роль:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="user">Пользователь</option>
            <option value="manager">Менеджер</option>
          </select>
          {selectedRole !== user.role && (
            <button onClick={handleRoleChange} className="btn-change-role">
              Сохранить роль
            </button>
          )}
        </div>
      )}

      {canAssignTask && (
        <>
          <input
            value={taskData.title}
            onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Название задачи"
          />

          <textarea
            value={taskData.description}
            onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Описание (необязательно)"
            rows="2"
          />

          <input
            type="date"
            value={taskData.deadline}
            onChange={(e) => setTaskData(prev => ({ ...prev, deadline: e.target.value }))}
          />

          <button onClick={handleAssign}>
            Назначить задачу
          </button>
        </>
      )}

      {!canAssignTask && !canChangeRole && (
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
          Просмотр информации
        </p>
      )}
    </div>
  )
}
