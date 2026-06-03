import CalendarDay from "./CalendarDay"

const MS_PER_DAY = 24 * 60 * 60 * 1000

const parseCalendarDate = (value) => {
  if (!value) return null

  const datePart = String(value).slice(0, 10)
  const [year, month, day] = datePart.split("-").map(Number)

  if (year && month && day) {
    return new Date(year, month - 1, day)
  }

  const fallback = new Date(value)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date, days) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const getMonday = (date) => {
  const day = date.getDay()
  const offset = day === 0 ? -6 : 1 - day
  return addDays(startOfDay(date), offset)
}

const getTaskRange = (task) => {
  const startDate = parseCalendarDate(task.createdAt) || parseCalendarDate(task.deadline)
  const endDate = parseCalendarDate(task.deadline) || startDate

  if (!startDate || !endDate) return null

  const start = startOfDay(startDate)
  const end = startOfDay(endDate)

  return start <= end
    ? { start, end }
    : { start: end, end: start }
}

const getStatusLabel = (status) => {
  const labels = {
    todo: "К выполнению",
    inProgress: "В работе",
    done: "Готово"
  }

  return labels[status] || status
}

const buildWeekSegments = (week, tasks) => {
  const weekStart = week[0]
  const weekEnd = week[6]
  const segments = []

  tasks.forEach((task) => {
    const range = getTaskRange(task)
    if (!range || range.end < weekStart || range.start > weekEnd) return

    const segmentStart = range.start < weekStart ? weekStart : range.start
    const segmentEnd = range.end > weekEnd ? weekEnd : range.end
    const startIndex = Math.round((segmentStart - weekStart) / MS_PER_DAY)
    const endIndex = Math.round((segmentEnd - weekStart) / MS_PER_DAY)

    segments.push({
      id: task.id,
      title: task.title,
      status: task.status,
      startIndex,
      endIndex,
      continuesBefore: range.start < weekStart,
      continuesAfter: range.end > weekEnd
    })
  })

  const lanes = []

  return segments
    .sort((first, second) => first.startIndex - second.startIndex || second.endIndex - first.endIndex)
    .map((segment) => {
      let laneIndex = lanes.findIndex((laneEnd) => laneEnd < segment.startIndex)

      if (laneIndex === -1) {
        laneIndex = lanes.length
        lanes.push(segment.endIndex)
      } else {
        lanes[laneIndex] = segment.endIndex
      }

      return {
        ...segment,
        laneIndex
      }
    })
}

const CalendarGrid = ({ date, tasks }) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const gridStart = getMonday(monthStart)
  const gridEnd = addDays(getMonday(monthEnd), 6)
  const weeks = []

  for (let weekStart = gridStart; weekStart <= gridEnd; weekStart = addDays(weekStart, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)))
  }

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

  return (
    <>
      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-weeks">
        {weeks.map((week) => {
          const weekKey = week[0].toISOString()
          const segments = buildWeekSegments(week, tasks)
          const visibleSegments = segments.slice(0, 4)
          const hiddenCount = segments.length - visibleSegments.length

          return (
            <div
              key={weekKey}
              className="calendar-week"
              style={{ "--calendar-lanes": Math.max(visibleSegments.length, 1) }}
            >
              <div className="calendar-week-days">
                {week.map((day) => (
                  <CalendarDay
                    key={day.toISOString()}
                    day={day}
                    isOutsideMonth={day.getMonth() !== month}
                  />
                ))}
              </div>

              <div className="calendar-range-layer">
                {visibleSegments.map((segment) => (
                  <div
                    key={`${segment.id}-${segment.startIndex}-${segment.endIndex}`}
                    className={[
                      "calendar-task-range",
                      segment.status,
                      segment.continuesBefore ? "continues-before" : "",
                      segment.continuesAfter ? "continues-after" : ""
                    ].filter(Boolean).join(" ")}
                    style={{
                      gridColumn: `${segment.startIndex + 1} / ${segment.endIndex + 2}`,
                      gridRow: segment.laneIndex + 1
                    }}
                    title={`${segment.title} · ${getStatusLabel(segment.status)}`}
                  >
                    <span>{segment.title}</span>
                  </div>
                ))}

                {hiddenCount > 0 && (
                  <div className="calendar-range-more">
                    +{hiddenCount} еще
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default CalendarGrid
