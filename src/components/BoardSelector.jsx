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
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        marginBottom: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0 }}>Доски проекта</h3>
        {canCreateBoard && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            style={{
              padding: "8px 16px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            {isCreating ? "Отмена" : "+ Создать доску"}
          </button>
        )}
      </div>

      {isCreating && (
        <div
          style={{
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "16px"
          }}
        >
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Название доски"
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
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setNewBoardColor(color.value)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: color.value,
                  border: newBoardColor === color.value ? "3px solid #1e293b" : "2px solid #e2e8f0",
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
              background: "#3b82f6",
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
        {boards.map((board) => {
          const canDelete = board.createdBy === userId || userRole === "superadmin"

          return (
            <div
              key={board.id}
              style={{
                padding: "12px 16px",
                background: currentBoard?.id === board.id ? board.color : "#f1f5f9",
                color: currentBoard?.id === board.id ? "white" : "#64748b",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}
            >
              <span onClick={() => onSelectBoard(board)} style={{ flex: 1 }}>
                {board.name}
              </span>
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(board)
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: currentBoard?.id === board.id ? "white" : "#ef4444",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "2px"
                  }}
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
