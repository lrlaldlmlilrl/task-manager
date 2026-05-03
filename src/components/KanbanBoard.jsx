import { useRef } from "react"
import Column from "./Column"

export default function KanbanBoard({ tasks, onChangeStatus, onDelete, onEdit }) {
  const draggedTaskId = useRef(null)

  const handleDragStart = (id) => {
    draggedTaskId.current = id
  }

  const handleDrop = (targetStatus) => {
    if (draggedTaskId.current === null) return

    const task = tasks.find(t => t.id === draggedTaskId.current)
    if (task && task.status !== targetStatus) {
      onChangeStatus(draggedTaskId.current, targetStatus)
    }

    draggedTaskId.current = null
  }

  return (
    <div className="kanban">
      <Column
        title="Новые"
        status="todo"
        tasks={tasks}
        onChangeStatus={onChangeStatus}
        onDelete={onDelete}
        onEdit={onEdit}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
      />
      <Column
        title="В работе"
        status="inProgress"
        tasks={tasks}
        onChangeStatus={onChangeStatus}
        onDelete={onDelete}
        onEdit={onEdit}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
      />
      <Column
        title="Готово"
        status="done"
        tasks={tasks}
        onChangeStatus={onChangeStatus}
        onDelete={onDelete}
        onEdit={onEdit}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
      />
    </div>
  )
}
