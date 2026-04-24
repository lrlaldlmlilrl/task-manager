import Sidebar from "../components/SideBar"
import TopBar from "../components/TopBar"
import KanbanBoard from "../components/KanbanBoard"
import Modal from "../components/Modal"
import BoardSelector from "../components/BoardSelector"
import ProjectSelector from "../components/ProjectSelector"
import { useState, useEffect } from "react"
import { getBoards, createBoard, deleteBoard, getBoardTasks } from "../services/boardService"
import { getProjects, createProject, deleteProject, getProjectBoards } from "../services/projectService"

export default function DashboardPage({ 
  user, 
  tasks,
  users = [],
  onChangeStatus, 
  onDeleteTask, 
  onEditTask, 
  onAddTask,
  onLogout 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [boards, setBoards] = useState([])
  const [currentBoard, setCurrentBoard] = useState(null)
  const [boardTasks, setBoardTasks] = useState([])

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (currentProject) {
      loadProjectBoards(currentProject.id)
      setCurrentBoard(null) // Сбрасываем выбранную доску при смене проекта
    } else {
      loadBoards() // Загружаем все доски если проект не выбран
      setCurrentBoard(null)
    }
  }, [currentProject])

  useEffect(() => {
    if (currentBoard) {
      loadBoardTasks(currentBoard.id)
    }
  }, [currentBoard])

  const loadProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (err) {
      console.error("Ошибка загрузки проектов:", err)
    }
  }

  const loadBoards = async () => {
    try {
      const data = await getBoards()
      setBoards(data)
    } catch (err) {
      console.error("Ошибка загрузки досок:", err)
    }
  }

  const loadProjectBoards = async (projectId) => {
    try {
      const data = await getProjectBoards(projectId)
      setBoards(data)
    } catch (err) {
      console.error("Ошибка загрузки досок проекта:", err)
    }
  }

  const loadBoardTasks = async (boardId) => {
    try {
      const data = await getBoardTasks(boardId)
      setBoardTasks(data)
    } catch (err) {
      console.error("Ошибка загрузки задач доски:", err)
    }
  }

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData)
      setProjects(prev => [newProject, ...prev])
    } catch (err) {
      alert(`Ошибка создания проекта: ${err.message}`)
    }
  }

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      if (currentProject?.id === projectId) {
        setCurrentProject(null)
        setBoards([])
        setCurrentBoard(null)
        setBoardTasks([])
      }
    } catch (err) {
      alert(`Ошибка удаления проекта: ${err.message}`)
    }
  }

  const handleSelectProject = (project) => {
    setCurrentProject(project)
  }

  const handleCreateBoard = async (boardData) => {
    try {
      const newBoard = await createBoard(boardData)
      setBoards(prev => [newBoard, ...prev])
    } catch (err) {
      alert(`Ошибка создания доски: ${err.message}`)
    }
  }

  const handleDeleteBoard = async (boardId) => {
    try {
      await deleteBoard(boardId)
      setBoards(prev => prev.filter(b => b.id !== boardId))
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null)
        setBoardTasks([])
      }
    } catch (err) {
      alert(`Ошибка удаления доски: ${err.message}`)
    }
  }

  const handleSelectBoard = (board) => {
    setCurrentBoard(board)
    if (!board) {
      setBoardTasks([])
    }
  }

  const handleAddTaskToBoard = async (taskData) => {
    const taskWithBoard = {
      ...taskData,
      boardId: currentBoard?.id || null
    }
    const newTask = await onAddTask(taskWithBoard)
    
    // Обновляем задачи доски если мы на доске
    if (currentBoard) {
      await loadBoardTasks(currentBoard.id)
    }
  }

  const handleEditTaskOnBoard = async (taskData) => {
    await onEditTask(taskData)
    
    // Обновляем задачи доски если мы на доске
    if (currentBoard) {
      await loadBoardTasks(currentBoard.id)
    }
  }

  const handleDeleteTaskFromBoard = async (taskId) => {
    await onDeleteTask(taskId)
    
    // Обновляем задачи доски если мы на доске
    if (currentBoard) {
      await loadBoardTasks(currentBoard.id)
    }
  }

  const handleChangeStatusOnBoard = async (taskId, newStatus) => {
    await onChangeStatus(taskId, newStatus)
    
    // Обновляем задачи доски если мы на доске
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

  // Показываем кнопку создания задачи только для superadmin и manager
  const canCreateTask = user && ["superadmin", "manager"].includes(user.role)

  // Определяем какие задачи показывать
  const displayTasks = currentBoard ? boardTasks : tasks

  return (
    <div className="layout">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="main">
        <TopBar 
          title={currentBoard ? ` ${currentBoard.name}` : currentProject ? `${currentProject.name}` : "Доска задач"}
          onOpenModal={canCreateTask ? () => handleOpenModal() : null} 
        />

        <ProjectSelector
          projects={projects}
          currentProject={currentProject}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          userRole={user?.role}
          userId={user?.id}
        />

        {(currentProject || !currentProject) && (
          <BoardSelector
            boards={boards}
            currentBoard={currentBoard}
            onSelectBoard={handleSelectBoard}
            onCreateBoard={handleCreateBoard}
            onDeleteBoard={handleDeleteBoard}
            userRole={user?.role}
            userId={user?.id}
            currentProjectId={currentProject?.id}
          />
        )}

        <KanbanBoard
          tasks={displayTasks}
          onChangeStatus={handleChangeStatusOnBoard}
          onDelete={handleDeleteTaskFromBoard}
          onEdit={handleOpenModal}
        />

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
