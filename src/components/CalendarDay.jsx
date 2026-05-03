const parseDeadlineDate = (value) => {
  if (!value) return null

  const datePart = String(value).slice(0, 10)
  const [year, month, day] = datePart.split("-").map(Number)

  if (!year || !month || !day) {
    const fallback = new Date(value)
    return Number.isNaN(fallback.getTime()) ? null : fallback
  }

  return new Date(year, month - 1, day)
}

const CalendarDay = ({ day, tasks }) => {
  if (!day) return <div className="calendar-day empty"></div>

  const dayTasks = tasks.filter((task) => {
    const taskDate = parseDeadlineDate(task.deadline)

    if (!taskDate) {
      return false
    }

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
        {dayTasks.slice(0, 3).map((task) => (
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
