import './App.css'
import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"
import { Routes, Route, Navigate } from "react-router-dom"
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import { useEffect, useState } from "react"
import CalendarPage from './pages/CalendarPage'
import AdminPage from './pages/AdminPage'
import CompanyDashboardPage from './pages/CompanyDashboardPage'
import ProfilePage from './pages/ProfilePage'
import { getProfile, logout } from "./services/authService"
import { getTasks, createTask, updateTask, deleteTask } from "./services/taskService"
import { getUsers } from "./services/userService"
import AIAssistantPage from './pages/AIAssistantPage'

function App() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (user) {
      loadTasks()
      if (user.role === "superadmin" || user.role === "manager") {
        loadUsers()
      }
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const data = await getProfile()
      setUser(data)
    } catch (err) {
      console.error("Не авторизован:", err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      console.error("Ошибка загрузки задач:", err)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      console.error("Ошибка загрузки пользователей:", err)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      setTasks([])
      setUsers([])
    } catch (err) {
      console.error("Ошибка выхода:", err)
    }
  }

  const addTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData)
      setTasks(prev => [...prev, newTask])
      return newTask
    } catch (err) {
      console.error("Ошибка создания задачи:", err)
      alert("Не удалось создать задачу")
      throw err
    }
  }

  const editTask = async (updatedTask) => {
    try {
      const updated = await updateTask(updatedTask.id, updatedTask)
      setTasks(prev =>
        prev.map(task =>
          task.id === updated.id ? updated : task
        )
      )
    } catch (err) {
      console.error("Ошибка обновления задачи:", err)
      alert("Не удалось обновить задачу")
    }
  }

  const removeTask = async (taskId) => {
    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err) {
      console.error("Ошибка удаления задачи:", err)
      alert("Не удалось удалить задачу")
    }
  }

  const changeTaskStatus = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      // Передаём только нужные поля, assignedTo заменяем на assignedToId
      const updated = await updateTask(taskId, { 
        title: task.title,
        description: task.description,
        status: newStatus,
        assignedTo: task.assignedToId,
        deadline: task.deadline,
        boardId: task.boardId
      })
      setTasks(prev =>
        prev.map(t =>
          t.id === updated.id ? updated : t
        )
      )
    } catch (err) {
      console.error("Ошибка изменения статуса:", err)
      alert("Не удалось изменить статус")
    }
  }

  // Компонент для защищённых маршрутов
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Загрузка...
        </div>
      )
    }

    if (!user) {
      return <Navigate to="/login" replace />
    }

    return children
  }

  // Компонент для админских маршрутов (superadmin, manager)
  const AdminRoute = ({ children }) => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Загрузка...
        </div>
      )
    }

    if (!user) {
      return <Navigate to="/login" replace />
    }

    if (user.role !== "manager" && user.role !== "superadmin") {
      return <Navigate to="/home" replace />
    }

    return children
  }
  
  // Компонент только для superadmin (статистика компании)
  const SuperAdminRoute = ({ children }) => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Загрузка...
        </div>
      )
    }

    if (!user) {
      return <Navigate to="/login" replace />
    }

    if (user.role !== "superadmin") {
      return <Navigate to="/home" replace />
    }

    return children
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Загрузка...
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <HomePage
              user={user}
              tasks={tasks}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/ai-assistant" 
        element={
          <ProtectedRoute>
            <AIAssistantPage
              user={user}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage
              user={user}
              tasks={tasks}
              users={users}
              onChangeStatus={changeTaskStatus}
              onDeleteTask={removeTask}
              onEditTask={editTask}
              onAddTask={addTask}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } 
      />

      <Route
        path="/dashboard/projects/:projectId"
        element={
          <ProtectedRoute>
            <DashboardPage
              user={user}
              users={users}
              onChangeStatus={changeTaskStatus}
              onDeleteTask={removeTask}
              onEditTask={editTask}
              onAddTask={addTask}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/projects/:projectId/boards/:boardId"
        element={
          <ProtectedRoute>
            <DashboardPage
              user={user}
              users={users}
              onChangeStatus={changeTaskStatus}
              onDeleteTask={removeTask}
              onEditTask={editTask}
              onAddTask={addTask}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <CalendarPage
              user={user}
              tasks={tasks}
              onAddTask={addTask}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage 
              user={user}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPage
              user={user}
              users={users}
              onAddTask={addTask}
              onUpdateUsers={loadUsers}
              onLogout={handleLogout}
            />
          </AdminRoute>
        }
      />

      <Route 
        path="/company" 
        element={
          <SuperAdminRoute>
            <CompanyDashboardPage
              user={user}
              users={users}
              tasks={tasks}
              onLogout={handleLogout}
            />
          </SuperAdminRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
