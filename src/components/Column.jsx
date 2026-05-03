import { useState } from "react"
import TaskCard from "./TaskCard"

export default function Column({ title, tasks, status, onChangeStatus, onDelete, onEdit, onDragStart, onDrop }) {
  const [isDragOver, setIsDragOver] = useState(false)

  const filteredTasks = tasks.filter(task => task.status === status)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(status)
  }

  return (
    <div
      className={`column ${isDragOver ? "column-drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3>
        {title} <span className="task-count">({filteredTasks.length})</span>
      </h3>

      <div className="column-tasks">
        {filteredTasks.length === 0 ? (
          <p className="empty-column">Нет задач</p>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onChangeStatus={onChangeStatus}
              onDelete={onDelete}
              onEdit={() => onEdit(task)}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  )
}
