const TaskRow = ({ task }) => {
  const getStatusText = (status) => {
    switch (status) {
      case "todo":
        return "Новая"
      case "inProgress":
        return "В работе"
      case "done":
        return "Готово"
      default:
        return ""
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  const isOverdue = () => {
    if (!task.deadline) return false
    return new Date(task.deadline) < new Date() && task.status !== "done"
  }

  return (
    <div className={`task-row ${isOverdue() ? "overdue" : ""}`}>
      <div className="task-row-content">
        <p className="task-row-title">{task.title}</p>
        {task.description && (
          <p className="task-row-description">{task.description}</p>
        )}
        <div className="task-row-meta">
          {task.assignedTo && <span> {task.assignedTo}</span>}
          {task.deadline && (
            <span className={isOverdue() ? "overdue-text" : ""}>
              {formatDate(task.deadline)}
            </span>
          )}
        </div>
      </div>

      <span className={`status-badge ${task.status}`}>
        {getStatusText(task.status)}
      </span>
    </div>
  )
}

export default TaskRow
