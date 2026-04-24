export default function TaskCard({ task, onChangeStatus, onDelete, onEdit }) {
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

  return (
    <div className={`task ${isOverdue() ? "overdue" : ""}`}>
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
            onClick={() => onChangeStatus(id, "inProgress")}
            title="В работу"
          >
            Далее
          </button>
        )}

        {status === "inProgress" && (
          <button 
            onClick={() => onChangeStatus(id, "done")}
            title="Завершить"
          >
            Выполнено
          </button>
        )}

        <button onClick={onEdit} title="Редактировать">
          Ред.
        </button>
        
        <button onClick={() => {
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
