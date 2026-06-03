const isSameDay = (first, second) => (
  first.getDate() === second.getDate() &&
  first.getMonth() === second.getMonth() &&
  first.getFullYear() === second.getFullYear()
)

const CalendarDay = ({ day, isOutsideMonth }) => {
  if (!day) return <div className="calendar-day empty"></div>

  const isToday = isSameDay(day, new Date())

  return (
    <div className={`calendar-day ${isOutsideMonth ? "outside-month" : ""} ${isToday ? "today" : ""}`}>
      <div className="day-number">{day.getDate()}</div>
    </div>
  )
}

export default CalendarDay
