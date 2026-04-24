const CalendarDay = ({ day, tasks }) => {
  if (!day) return <div className="calendar-day empty"></div>

  const dayTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt || task.deadline)
    return (
      taskDate.getDate() === day.getDate() &&
      taskDate.getMonth() === day.getMonth() &&
      taskDate.getFullYear() === day.getFullYear()
    )
  })

  return (
    <div className="calendar-day">
      <div className="day-number">{day.getDate()}</div>

      <div className="day-tasks">
        {dayTasks.slice(0, 3).map(task => (
          <div key={task.id} className={`mini-task ${task.status}`} title={task.title}>
            {task.title}
          </div>
        ))}
        {dayTasks.length > 3 && (
          <div className="mini-task-more">
            +{dayTasks.length - 3} ещё
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarDay
