import { useEffect, useState } from "react"
import { getProjectBoards } from "../services/projectService"

export default function UserCard({ user, currentUser, onAssignTask, onRoleChange, projects = [] }) {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    deadline: "",
    projectId: "",
    boardId: ""
  })
  const [boards, setBoards] = useState([])
  const [selectedRole, setSelectedRole] = useState(user.role)

  const canChangeRole = currentUser && currentUser.role === "superadmin"
  const canAssignTask = currentUser && (currentUser.role === "superadmin" || currentUser.role === "manager")

  useEffect(() => {
    if (!taskData.projectId) {
      setBoards([])
      return
    }

    loadBoards(taskData.projectId)
  }, [taskData.projectId])

  const loadBoards = async (projectId) => {
    try {
      const data = await getProjectBoards(projectId)
      setBoards(data)
    } catch (err) {
      console.error("Ошибка загрузки досок проекта:", err)
      setBoards([])
    }
  }

  const handleAssign = async () => {
    if (!taskData.title.trim()) {
      alert("Введите название задачи")
      return
    }

    if (!taskData.projectId) {
      alert("Выберите проект")
      return
    }

    if (!taskData.boardId) {
      alert("Выберите доску")
      return
    }

    try {
      await onAssignTask({
        title: taskData.title,
        description: taskData.description,
        deadline: taskData.deadline,
        boardId: Number(taskData.boardId),
        assignedTo: user.id
      })

      setTaskData({
        title: "",
        description: "",
        deadline: "",
        projectId: "",
        boardId: ""
      })
      setBoards([])
    } catch (error) {
      console.error("Ошибка назначения задачи:", error)
    }
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
            <button type="button" onClick={handleRoleChange} className="btn-change-role">
              Сохранить роль
            </button>
          )}
        </div>
      )}

      {canAssignTask && (
        <>
          <input
            value={taskData.title}
            onChange={(e) => setTaskData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Название задачи"
          />

          <textarea
            value={taskData.description}
            onChange={(e) => setTaskData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Описание (необязательно)"
            rows="2"
          />

          <select
            value={taskData.projectId}
            onChange={(e) => setTaskData((prev) => ({ ...prev, projectId: e.target.value, boardId: "" }))}
          >
            <option value="">Выберите проект</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={taskData.boardId}
            onChange={(e) => setTaskData((prev) => ({ ...prev, boardId: e.target.value }))}
            disabled={!taskData.projectId}
          >
            <option value="">Выберите доску</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={taskData.deadline}
            onChange={(e) => setTaskData((prev) => ({ ...prev, deadline: e.target.value }))}
          />

          <button type="button" onClick={handleAssign}>
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
