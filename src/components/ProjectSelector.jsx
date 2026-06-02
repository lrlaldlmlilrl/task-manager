import { useState } from "react"

export default function ProjectSelector({
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  userRole,
  userId
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectColor, setNewProjectColor] = useState("#8b5cf6")

  const handleCreate = () => {
    if (!newProjectName.trim()) {
      alert("Введите название проекта")
      return
    }

    onCreateProject({
      name: newProjectName,
      color: newProjectColor
    })

    setNewProjectName("")
    setNewProjectColor("#8b5cf6")
    setIsCreating(false)
  }

  const handleDelete = (project) => {
    if (window.confirm(`Удалить проект "${project.name}"? Все доски и задачи проекта будут удалены.`)) {
      onDeleteProject(project.id)
    }
  }

  const colors = [
    { value: "#8b5cf6", name: "Фиолетовый" },
    { value: "#3b82f6", name: "Синий" },
    { value: "#10b981", name: "Зеленый" },
    { value: "#f59e0b", name: "Оранжевый" },
    { value: "#ef4444", name: "Красный" },
    { value: "#ec4899", name: "Розовый" }
  ]

  const canCreateProject = userRole === "manager" || userRole === "superadmin"

  return (
    <div className="selector-card">
      <div className="selector-header">
        <h3 className="selector-title">Проекты</h3>
        {canCreateProject && (
          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="selector-toggle-btn project"
          >
            {isCreating ? "Отмена" : "+ Создать проект"}
          </button>
        )}
      </div>

      {isCreating && (
        <div className="selector-create">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Название проекта"
            className="selector-input"
          />

          <div className="selector-colors">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setNewProjectColor(color.value)}
                style={{
                  background: color.value,
                  border: newProjectColor === color.value ? "3px solid #1e293b" : "2px solid #e2e8f0"
                }}
                className="selector-color-btn"
                title={color.name}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="selector-submit-btn project"
          >
            Создать
          </button>
        </div>
      )}

      <div className="selector-list">
        {projects.map((project) => {
          const canDelete = project.createdBy === userId || userRole === "superadmin"

          return (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              style={{
                background: currentProject?.id === project.id ? project.color : "#f1f5f9",
                color: currentProject?.id === project.id ? "white" : "#64748b"
              }}
              className="selector-item"
            >
              <span className="selector-item-name">{project.name}</span>
              {canDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(project)
                  }}
                  style={{
                    color: currentProject?.id === project.id ? "white" : "#ef4444"
                  }}
                  className="selector-delete-btn"
                  title="Удалить проект"
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
