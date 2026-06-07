export default function TaskCard({ task, onChangeStatus, onDelete, onEdit, onDragStart }) {
  const { id, title, description, status, assignedTo, deadline } = task

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short"
    })
  }

  const isOverdue = () => {
    if (!deadline) return false
    return new Date(deadline) < new Date() && status !== "done"
  }

  const handleChangeStatus = (event, newStatus) => {
    event.preventDefault()
    event.stopPropagation()
    onChangeStatus(id, newStatus)
  }

  return (
    <div
      className={`task ${isOverdue() ? "overdue" : ""}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        onDragStart(id)
      }}
    >
      <div className="task-content">
        <p className="task-title">{title}</p>
        {description && <p className="task-description">{description}</p>}

        <div className="task-meta">
          {assignedTo && (
            <span className="task-assigned">{assignedTo}</span>
          )}
          {deadline && (
            <span className={`task-deadline ${isOverdue() ? "overdue-text" : ""}`}>
              {formatDate(deadline)}
            </span>
          )}
        </div>
      </div>

      <div className="actions">
        {status === "todo" && (
          <button
            type="button"
            onClick={(event) => handleChangeStatus(event, "inProgress")}
            title="В работу"
          >
            Далее
          </button>
        )}

        {status === "inProgress" && (
          <button
            type="button"
            onClick={(event) => handleChangeStatus(event, "done")}
            title="Завершить"
          >
            Выполнено
          </button>
        )}

        <button type="button" onClick={onEdit} title="Редактировать">
          Ред.
        </button>

        <button type="button" onClick={() => {
          if (window.confirm("Удалить задачу?")) {
            onDelete(id)
          }
        }} title="Удалить">
          Удалить
        </button>
      </div>
    </div>
  )
}
