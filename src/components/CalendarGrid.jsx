import CalendarDay from "./CalendarDay"

const CalendarGrid = ({ date, tasks }) => {
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []

  // Сдвиг (чтобы неделя начиналась с понедельника)
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  for (let i = 0; i < startOffset; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

  return (
    <>
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day, index) => (
          <CalendarDay key={index} day={day} tasks={tasks} />
        ))}
      </div>
    </>
  )
}

export default CalendarGrid
