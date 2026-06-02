import { useEffect, useMemo, useState } from "react"
import Sidebar from "../components/SideBar"
import KPIBlock from "../components/KPIBlock"
import EmployeeList from "../components/EmployeeList"
import "../styles/company.css"
import AIChat from "../components/AIChat"

export default function CompanyDashboardPage({ user, tasks, users, onLogout }) {
  const [selectedUserId, setSelectedUserId] = useState(null)

  useEffect(() => {
    if (!users.length) {
      setSelectedUserId(null)
      return
    }

    const hasSelectedUser = users.some((employee) => employee.id === selectedUserId)
    if (!hasSelectedUser) {
      setSelectedUserId(users[0].id)
    }
  }, [users, selectedUserId])

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Загрузка...
      </div>
    )
  }

  if (user.role !== "superadmin") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Нет прав доступа
      </div>
    )
  }

  const activeTasks = tasks.filter((task) => task.status !== "done").length
  const completed = tasks.filter((task) => task.status === "done").length
  const overdue = tasks.filter((task) => {
    if (!task.deadline || task.status === "done") return false
    return new Date(task.deadline) < new Date()
  }).length
  const employees = users.length
 const inProgress = tasks.filter((task) => task.status === "inProgress").length
  const completedToday = tasks.filter((task) => {
    if (task.status !== "done") return false
    const today = new Date()
    const taskDate = new Date(task.updatedAt || task.createdAt)
    return taskDate.toDateString() === today.toDateString()
  }).length

  const selectedUser = users.find((employee) => employee.id === selectedUserId) || null
  const selectedUserTasks = useMemo(() => {
    if (!selectedUser) return []
    return tasks.filter((task) => task.assignedToId === selectedUser.id)
  }, [selectedUser, tasks])

  const selectedUserTodo = selectedUserTasks.filter((task) => task.status === "todo").length
  const selectedUserInProgress = selectedUserTasks.filter((task) => task.status === "inProgress").length
  const selectedUserDone = selectedUserTasks.filter((task) => task.status === "done").length
  const selectedUserOverdue = selectedUserTasks.filter((task) => {
    if (!task.deadline || task.status === "done") return false
    return new Date(task.deadline) < new Date()
  }).length 
  const selectedUserCompletedToday = selectedUserTasks.filter((task) => {
    if (task.status !== "done") return false
    const today = new Date()
    const taskDate = new Date(task.updatedAt || task.createdAt)
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
                <h3>Информация о компании</h3>
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

              <div className="card">
                <h3>Статистика сотрудника</h3>
                {selectedUser ? (
                  <div className="employee-stats">
                    <div className="employee-stats-header">
                      <div className="employee-stats-name">
                        {selectedUser.fullName || selectedUser.name || selectedUser.login}
                      </div>
                      <div className="employee-stats-login">@{selectedUser.login}</div>
                    </div>

                    <div className="employee-stats-grid">
                      <div className="employee-stat-item">
                        <span>Всего задач</span>
                        <strong>{selectedUserTasks.length}</strong>
                      </div>
                      <div className="employee-stat-item">
                        <span>Новые</span>
                        <strong>{selectedUserTodo}</strong>
                      </div>
                      <div className="employee-stat-item">
                        <span>В работе</span>
                        <strong>{selectedUserInProgress}</strong>
                      </div>
                      <div className="employee-stat-item">
                        <span>Выполнено</span>
                        <strong>{selectedUserDone}</strong>
                      </div>
                      <div className="employee-stat-item">
                        <span>Выполнено сегодня</span>
                        <strong>{selectedUserCompletedToday}</strong>
                      </div>
                      <div className={`employee-stat-item ${selectedUserOverdue > 0 ? "danger" : ""}`}>
                        <span>Просрочено</span>
                        <strong>{selectedUserOverdue}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Сотрудники не найдены</p>
                )}
              </div>
            </div>

            <EmployeeList
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
