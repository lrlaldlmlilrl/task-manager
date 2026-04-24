import Sidebar from "../components/SideBar"
import "../styles/profile.css"

export default function ProfilePage({ user, onLogout }) {
  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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

  return (
    <div className="layout">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="main">
        <div className="profile-page">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#2563EB"/>
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

            <div className="profile-info">
              <div className="info-row">
                <span>Логин</span>
                <span>{user.login}</span>
              </div>

              {user.fullName && (
                <div className="info-row">
                  <span>Имя</span>
                  <span>{user.fullName}</span>
                </div>
              )}

              {user.phone && (
                <div className="info-row">
                  <span>Телефон</span>
                  <span>{user.phone}</span>
                </div>
              )}

              <div className="info-row">
                <span>Роль</span>
                <span>{getRoleName(user.role)}</span>
              </div>

              {user.createdAt && (
                <div className="info-row">
                  <span>Дата регистрации</span>
                  <span>
                    {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
