import Sidebar from "../components/SideBar"
import UserCard from "../components/UserCard"
import { updateUserRole } from "../services/userService"

export default function AdminPage({ user, users, onAddTask, onUpdateUsers, onLogout }) {
  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Загрузка...
      </div>
    )
  }


  if (!["superadmin", "manager"].includes(user.role)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Нет прав доступа
      </div>
    )
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole)
      alert("Роль успешно изменена!")
      if (onUpdateUsers) {
        onUpdateUsers() 
      }
    } catch (err) {
      alert(`Ошибка изменения роли: ${err.message}`)
    }
  }


  const filteredUsers = users.filter(u => u.id !== user.id && u.role !== "superadmin")

  return (
    <div className="layout">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="main">
        <div className="admin">
          <h1>Управление пользователями</h1>
          <p className="admin-subtitle">
            {user.role === "superadmin" 
              ? "Управляйте ролями и назначайте задачи сотрудникам"
              : "Назначайте задачи сотрудникам"}
          </p>

          <div className="user-list">
            {filteredUsers.length === 0 ? (
              <p>Нет других пользователей</p>
            ) : (
              filteredUsers.map(u => (
                <UserCard 
                  key={u.id}
                  user={u}
                  currentUser={user}
                  onAssignTask={onAddTask}
                  onRoleChange={handleRoleChange}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
