import TaskCard from "./TaskCard"

export default function Column({ title, tasks, status, onChangeStatus, onDelete, onEdit }) {
  const filteredTasks = tasks.filter(task => task.status === status)

  return (
    <div className="column">
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
            />
          ))
        )}
      </div>
    </div>
  )
}
