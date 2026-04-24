import Sidebar from "../components/SideBar"
import TaskRow from "../components/TaskRow"
import "../styles/home.css"

export default function HomePage({ user, tasks = [], onLogout }) {
  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Загрузка...
      </div>
    )
  }

  const today = new Date()
  const formattedDate = today.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long"
  })

  // Фильтруем задачи пользователя
  const userTasks = tasks.filter(task => {
    // Если пользователь superadmin или manager, показываем все задачи
    if (["superadmin", "manager"].includes(user.role)) return true
    // Иначе только задачи, назначенные на этого пользователя (по ID)
    return task.assignedToId === user.id
  })

  // Статистика
  const todoCount = userTasks.filter(t => t.status === "todo").length
  const inProgressCount = userTasks.filter(t => t.status === "inProgress").length
  const doneCount = userTasks.filter(t => t.status === "done").length
  const overdueCount = userTasks.filter(t => {
    if (!t.deadline || t.status === "done") return false
    return new Date(t.deadline) < new Date()
  }).length

  return (
    <div className="layout">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="main">
        <div className="home">
          <div className="home-header">
            <h1>Привет, {user.fullName || user.login}! </h1>
            <p>{formattedDate}</p>
          </div>

          <div className="home-stats">
            <div className="stat-card">
              <h3>{todoCount}</h3>
              <p>Новых задач</p>
            </div>
            <div className="stat-card">
              <h3>{inProgressCount}</h3>
              <p>В работе</p>
            </div>
            <div className="stat-card">
              <h3>{doneCount}</h3>
              <p>Выполнено</p>
            </div>
            {overdueCount > 0 && (
              <div className="stat-card danger">
                <h3>{overdueCount}</h3>
                <p>Просрочено</p>
              </div>
            )}
          </div>

          <div className="home-tasks">
            <h2>Мои задачи ({userTasks.length})</h2>

            <div className="task-list">
              {userTasks.length === 0 ? (
                <p className="no-tasks">У вас пока нет задач</p>
              ) : (
                userTasks.map(task => (
                  <TaskRow key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
