import { useState } from "react"

export default function ProjectSelector({ projects, currentProject, onSelectProject, onCreateProject, onDeleteProject, userRole, userId }) {
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
    { value: "#10b981", name: "Зелёный" },
    { value: "#f59e0b", name: "Оранжевый" },
    { value: "#ef4444", name: "Красный" },
    { value: "#ec4899", name: "Розовый" }
  ]

  const canCreateProject = userRole === "manager" || userRole === "superadmin"

  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "16px",
      marginBottom: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0 }}>Проекты</h3>
        {canCreateProject && (
          <button 
            onClick={() => setIsCreating(!isCreating)}
            style={{
              padding: "8px 16px",
              background: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            {isCreating ? "Отмена" : "+ Создать проект"}
          </button>
        )}
      </div>

      {isCreating && (
        <div style={{
          background: "#f8fafc",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "16px"
        }}>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Название проекта"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "2px solid #e2e8f0",
              marginBottom: "12px",
              fontSize: "14px"
            }}
          />
          
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
            {colors.map(color => (
              <button
                key={color.value}
                onClick={() => setNewProjectColor(color.value)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: color.value,
                  border: newProjectColor === color.value ? "3px solid #1e293b" : "2px solid #e2e8f0",
                  cursor: "pointer"
                }}
                title={color.name}
              />
            ))}
          </div>

          <button
            onClick={handleCreate}
            style={{
              width: "100%",
              padding: "10px",
              background: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Создать
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div
          onClick={() => onSelectProject(null)}
          style={{
            padding: "12px 16px",
            background: !currentProject ? "#8b5cf6" : "#f1f5f9",
            color: !currentProject ? "white" : "#64748b",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
        >
          Все проекты
        </div>

        {projects.map(project => {
          const canDelete = project.createdBy === userId || userRole === "superadmin"
          
          return (
            <div
              key={project.id}
              style={{
                padding: "12px 16px",
                background: currentProject?.id === project.id ? project.color : "#f1f5f9",
                color: currentProject?.id === project.id ? "white" : "#64748b",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}
            >
              <span onClick={() => onSelectProject(project)} style={{ flex: 1 }}>
                {project.name}
              </span>
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(project)
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: currentProject?.id === project.id ? "white" : "#ef4444",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "2px"
                  }}
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
