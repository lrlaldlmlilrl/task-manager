import { useState } from "react"

export default function EmployeeList({ users }) {
  const [selected, setSelected] = useState(users[0]?.id)

  const getRoleName = (role) => {
    const roleNames = {
      superadmin: "Супер-админ",
      manager: "Менеджер",
      user: "Пользователь"
    }
    return roleNames[role] || "Пользователь"
  }

  return (
    <div className="employees card">
      <h3>Сотрудники ({users.length})</h3>

      <div className="employee-list-container">
        {users.map(user => (
          <div
            key={user.id}
            className={`employee ${selected === user.id ? "active" : ""}`}
            onClick={() => setSelected(user.id)}
          >
            <div className="employee-avatar">
              {(user.fullName || user.name || user.login).charAt(0).toUpperCase()}
            </div>
            <div className="employee-info">
              <div className="employee-name">{user.fullName || user.name || user.login}</div>
              <div className="employee-role">{getRoleName(user.role)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
