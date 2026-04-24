import Sidebar from "../components/SideBar"
import KPIBlock from "../components/KPIBlock"
import EmployeeList from "../components/EmployeeList"
import "../styles/company.css"
import AIChat from "../components/AIChat"

export default function CompanyDashboardPage({ user, tasks, users, onLogout }) {
  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Загрузка...
      </div>
    )
  }

  // Доступ только для superadmin
  if (user.role !== "superadmin") {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Нет прав доступа
      </div>
    )
  }

  const activeTasks = tasks.filter(t => t.status !== "done").length
  const completed = tasks.filter(t => t.status === "done").length
  const overdue = tasks.filter(t => {
    if (!t.deadline || t.status === "done") return false
    return new Date(t.deadline) < new Date()
  }).length
  const employees = users.length

  const inProgress = tasks.filter(t => t.status === "inProgress").length
  const completedToday = tasks.filter(t => {
    if (t.status !== "done") return false
    const today = new Date()
    const taskDate = new Date(t.updatedAt || t.createdAt)
    return taskDate.toDateString() === today.toDateString()
  }).length

  return (
    <div className="layout">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="main">
        <div className="company">
          <h1>Статистика компании</h1>

          <div className="kpi-row">
            <KPIBlock title="Задачи в работе" value={activeTasks} icon="" />
            <KPIBlock title="Выполненные" value={completed} icon="" />
            <KPIBlock title="Просроченные" value={overdue} danger icon="" />
            <KPIBlock title="Сотрудников" value={employees} icon="" />
          </div>

          <div className="company-content">
            <div className="company-left">
              <div className="card">
                <h3>Информация компании</h3>
                <p><strong>Название:</strong> TaskManager</p>
                <p><strong>Специализация:</strong> Управление задачами</p>
                <p><strong>Основан:</strong> 2024</p>
              </div>

              <div className="card">
                <h3>Статистика на сегодня</h3>
                <p>В процессе: <strong>{inProgress}</strong></p>
                <p>Выполнены сегодня: <strong>{completedToday}</strong></p>
                <p className={overdue > 0 ? "danger" : ""}>
                  Просрочено: <strong>{overdue}</strong>
                </p>
              </div>
            </div>

            <EmployeeList users={users} />
          </div>
        </div>
      </main> 
    </div>
  )
}
