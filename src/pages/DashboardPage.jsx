import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Sidebar from "../components/SideBar"
import TopBar from "../components/TopBar"
import KanbanBoard from "../components/KanbanBoard"
import Modal from "../components/Modal"
import BoardSelector from "../components/BoardSelector"
import ProjectSelector from "../components/ProjectSelector"
import { createBoard, deleteBoard, getBoardTasks } from "../services/boardService"
import { createProject, deleteProject, getProjectBoards, getProjects } from "../services/projectService"

export default function DashboardPage({
  user,
  users = [],
  onChangeStatus,
  onDeleteTask,
  onEditTask,
  onAddTask,
  onLogout
}) {
  const navigate = useNavigate()
  const { projectId, boardId } = useParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [boards, setBoards] = useState([])
  const [currentBoard, setCurrentBoard] = useState(null)
  const [boardTasks, setBoardTasks] = useState([])
  const [selectedAssignee, setSelectedAssignee] = useState("all")

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (!projectId) {
      setCurrentProject(null)
      setBoards([])
      setCurrentBoard(null)
      setBoardTasks([])
      setSelectedAssignee("all")
      return
    }

    const selectedProject = projects.find((project) => String(project.id) === String(projectId)) || null
    setCurrentProject(selectedProject)
    loadProjectBoards(projectId)
  }, [projectId, projects])

  useEffect(() => {
    if (!boardId) {
      setCurrentBoard(null)
      setBoardTasks([])
      setSelectedAssignee("all")
      return
    }

    const selectedBoard = boards.find((board) => String(board.id) === String(boardId)) || null
    setCurrentBoard(selectedBoard)
    setSelectedAssignee("all")
    loadBoardTasks(boardId)
  }, [boardId, boards])

  const loadProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (err) {
      console.error("Ошибка загрузки проектов:", err)
    }
  }

  const loadProjectBoards = async (selectedProjectId) => {
    try {
      const data = await getProjectBoards(selectedProjectId)
      setBoards(data)
    } catch (err) {
      console.error("Ошибка загрузки досок проекта:", err)
    }
  }

  const loadBoardTasks = async (selectedBoardId) => {
    try {
      const data = await getBoardTasks(selectedBoardId)
      setBoardTasks(data)
    } catch (err) {
      console.error("Ошибка загрузки задач доски:", err)
    }
  }

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData)
      setProjects((prev) => [newProject, ...prev])
    } catch (err) {
      alert(`Ошибка создания проекта: ${err.message}`)
    }
  }

  const handleDeleteProject = async (selectedProjectId) => {
    try {
      await deleteProject(selectedProjectId)
      setProjects((prev) => prev.filter((project) => project.id !== selectedProjectId))

      if (String(currentProject?.id) === String(selectedProjectId)) {
        navigate("/dashboard")
      }
    } catch (err) {
      alert(`Ошибка удаления проекта: ${err.message}`)
    }
  }

  const handleSelectProject = (project) => {
    if (!project) {
      navigate("/dashboard")
      return
    }

    navigate(`/dashboard/projects/${project.id}`)
  }

  const handleCreateBoard = async (boardData) => {
    try {
      const newBoard = await createBoard(boardData)
      setBoards((prev) => [newBoard, ...prev])
    } catch (err) {
      alert(`Ошибка создания доски: ${err.message}`)
    }
  }

  const handleDeleteBoard = async (selectedBoardId) => {
    try {
      await deleteBoard(selectedBoardId)
      setBoards((prev) => prev.filter((board) => board.id !== selectedBoardId))

      if (String(currentBoard?.id) === String(selectedBoardId) && currentProject) {
        navigate(`/dashboard/projects/${currentProject.id}`)
      }
    } catch (err) {
      alert(`Ошибка удаления доски: ${err.message}`)
    }
  }

  const handleSelectBoard = (board) => {
    if (!currentProject) {
      return
    }

    if (!board) {
      navigate(`/dashboard/projects/${currentProject.id}`)
      return
    }

    navigate(`/dashboard/projects/${currentProject.id}/boards/${board.id}`)
  }

  const handleAddTaskToBoard = async (taskData) => {
    await onAddTask({
      ...taskData,
      boardId: currentBoard?.id || null
    })

    if (currentBoard) {
      await loadBoardTasks(currentBoard.id)
    }
  }

  const handleEditTaskOnBoard = async (taskData) => {
    await onEditTask(taskData)

    if (currentBoard) {
      await loadBoardTasks(currentBoard.id)
    }
  }

  const handleDeleteTaskFromBoard = async (taskId) => {
    await onDeleteTask(taskId)

    if (currentBoard) {
      await loadBoardTasks(currentBoard.id)
    }
  }

  const handleChangeStatusOnBoard = async (taskId, newStatus) => {
    await onChangeStatus(taskId, newStatus)

    if (currentBoard) {
      await loadBoardTasks(currentBoard.id)
    }
  }

  const handleOpenModal = (task = null) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingTask(null)
    setIsModalOpen(false)
  }

  const canCreateTask = user && ["superadmin", "manager"].includes(user.role)
  const canShowKanban = Boolean(currentProject && currentBoard)
  const assigneeOptions = Array.from(
    new Map(
      boardTasks
        .filter((task) => task.assignedToId || task.assignedTo)
        .map((task) => [
          String(task.assignedToId ?? "unassigned"),
          {
            value: String(task.assignedToId ?? "unassigned"),
            label: task.assignedTo || "Без исполнителя"
          }
        ])
    ).values()
  )
  const filteredBoardTasks = boardTasks.filter((task) => {
    if (selectedAssignee === "all") return true
    if (selectedAssignee === "unassigned") return !task.assignedToId
    return String(task.assignedToId) === selectedAssignee
  })
  const pageTitle = currentBoard
    ? currentBoard.name
    : currentProject
      ? `Доски проекта ${currentProject.name}`
      : "Проекты"

  return (
    <div className="layout">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="main">
        <TopBar
          title={pageTitle}
          onOpenModal={canCreateTask && canShowKanban ? () => handleOpenModal() : null}
        />

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "20px",
            color: "#64748b",
            fontSize: "14px"
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              border: "none",
              background: "transparent",
              color: "#3b82f6",
              cursor: "pointer",
              padding: 0
            }}
          >
            Проекты
          </button>

          {currentProject && (
            <>
              <span>/</span>
              <button
                type="button"
                onClick={() => navigate(`/dashboard/projects/${currentProject.id}`)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#3b82f6",
                  cursor: "pointer",
                  padding: 0
                }}
              >
                {currentProject.name}
              </button>
            </>
          )}

          {currentBoard && (
            <>
              <span>/</span>
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{currentBoard.name}</span>
            </>
          )}
        </div>

        <ProjectSelector
          projects={projects}
          currentProject={currentProject}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          userRole={user?.role}
          userId={user?.id}
        />

        {currentProject && (
          <BoardSelector
            boards={boards}
            currentBoard={currentBoard}
            onSelectBoard={handleSelectBoard}
            onCreateBoard={handleCreateBoard}
            onDeleteBoard={handleDeleteBoard}
            userRole={user?.role}
            userId={user?.id}
            currentProjectId={currentProject.id}
          />
        )}

        {canShowKanban ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                background: "white",
                padding: "16px 20px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}
            >
              <label htmlFor="assignee-filter" style={{ fontWeight: 600, color: "#0f172a" }}>
                Фильтр по исполнителю
              </label>
              <select
                id="assignee-filter"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                style={{
                  minWidth: "240px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  color: "#0f172a"
                }}
              >
                <option value="all">Все пользователи</option>
                <option value="unassigned">Без исполнителя</option>
                {assigneeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <KanbanBoard
              tasks={filteredBoardTasks}
              onChangeStatus={handleChangeStatusOnBoard}
              onDelete={handleDeleteTaskFromBoard}
              onEdit={handleOpenModal}
            />
          </>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              color: "#64748b"
            }}
          >
            {!currentProject && "Выберите проект, чтобы перейти к его доскам."}
            {currentProject && !currentBoard && "Выберите доску, чтобы открыть задачи этой доски."}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddTask={handleAddTaskToBoard}
          onEditTask={handleEditTaskOnBoard}
          editingTask={editingTask}
          users={users}
        />
      </main>
    </div>
  )
}
