import { useState } from "react"

export default function BoardSelector({
  boards,
  currentBoard,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  userRole,
  userId,
  currentProjectId
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [newBoardName, setNewBoardName] = useState("")
  const [newBoardColor, setNewBoardColor] = useState("#3b82f6")

  const handleCreate = () => {
    if (!newBoardName.trim()) {
      alert("Введите название доски")
      return
    }

    onCreateBoard({
      name: newBoardName,
      color: newBoardColor,
      projectId: currentProjectId || null
    })

    setNewBoardName("")
    setNewBoardColor("#3b82f6")
    setIsCreating(false)
  }

  const handleDelete = (board) => {
    if (window.confirm(`Удалить доску "${board.name}"? Все задачи на этой доске будут удалены.`)) {
      onDeleteBoard(board.id)
    }
  }

  const colors = [
    { value: "#3b82f6", name: "Синий" },
    { value: "#10b981", name: "Зеленый" },
    { value: "#f59e0b", name: "Оранжевый" },
    { value: "#ef4444", name: "Красный" },
    { value: "#8b5cf6", name: "Фиолетовый" },
    { value: "#ec4899", name: "Розовый" }
  ]

  const canCreateBoard = userRole === "manager" || userRole === "superadmin"

  return (
    <div className="selector-card">
      <div className="selector-header">
        <h3 className="selector-title">Доски проекта</h3>
        {canCreateBoard && (
          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="selector-toggle-btn board"
          >
            {isCreating ? "Отмена" : "+ Создать доску"}
          </button>
        )}
      </div>

      {isCreating && (
        <div className="selector-create">
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Название доски"
            className="selector-input"
          />

          <div className="selector-colors">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setNewBoardColor(color.value)}
                style={{
                  background: color.value,
                  border: newBoardColor === color.value ? "3px solid #1e293b" : "2px solid #e2e8f0"
                }}
                className="selector-color-btn"
                title={color.name}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="selector-submit-btn board"
          >
            Создать
          </button>
        </div>
      )}

      <div className="selector-list">
        {boards.map((board) => {
          const canDelete = board.createdBy === userId || userRole === "superadmin"

          return (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board)}
              style={{
                background: currentBoard?.id === board.id ? board.color : "#f1f5f9",
                color: currentBoard?.id === board.id ? "white" : "#64748b"
              }}
              className="selector-item"
            >
              <span className="selector-item-name">{board.name}</span>
              {canDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(board)
                  }}
                  style={{
                    color: currentBoard?.id === board.id ? "white" : "#ef4444"
                  }}
                  className="selector-delete-btn"
                  title="Удалить доску"
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
