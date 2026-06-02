export default function EmployeeList({ users, selectedUserId, onSelectUser }) {

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
            className={`employee ${selectedUserId === user.id ? "active" : ""}`}
            onClick={() => onSelectUser?.(user.id)}
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
