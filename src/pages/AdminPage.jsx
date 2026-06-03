import Sidebar from "../components/SideBar"
import UserCard from "../components/UserCard"
import { deleteUser, updateUser, updateUserRole } from "../services/userService"

export default function AdminPage({ user, users, onUpdateUsers, onLogout }) {
  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Загрузка...
      </div>
    )
  }

  if (!["superadmin", "manager"].includes(user.role)) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Нет прав доступа
      </div>
    )
  }

  const refreshUsers = () => {
    if (onUpdateUsers) {
      onUpdateUsers()
    }
  }

  const handleUserUpdate = async (userId, userData) => {
    try {
      await updateUser(userId, userData)
      refreshUsers()
    } catch (err) {
      alert(`Ошибка изменения пользователя: ${err.message}`)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId)
      refreshUsers()
    } catch (err) {
      alert(`Ошибка удаления пользователя: ${err.message}`)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole)
      refreshUsers()
    } catch (err) {
      alert(`Ошибка изменения роли: ${err.message}`)
    }
  }

  const filteredUsers = users.filter((item) => {
    if (item.id === user.id) return false
    if (user.role !== "superadmin" && item.role === "superadmin") return false
    return true
  })

  return (
    <div className="layout">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="main">
        <div className="admin">
          <h1>Управление пользователями</h1>
          <p className="admin-subtitle">
            {user.role === "superadmin"
              ? "Редактируйте данные пользователей, удаляйте учетные записи и меняйте роли."
              : "Редактируйте данные пользователей и удаляйте учетные записи."}
          </p>

          <div className="user-list">
            {filteredUsers.length === 0 ? (
              <p>Нет других пользователей</p>
            ) : (
              filteredUsers.map((item) => (
                <UserCard
                  key={item.id}
                  user={item}
                  currentUser={user}
                  onUpdateUser={handleUserUpdate}
                  onDeleteUser={handleDeleteUser}
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
