import Sidebar from "../components/SideBar"
import TopBar from "../components/TopBar"
import CalendarGrid from "../components/CalendarGrid"
import Modal from "../components/Modal"
import { useState } from "react"
import "../styles/calendar.css"

export default function CalendarPage({ user, tasks, onAddTask, onLogout }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)

  const changeMonth = (delta) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + delta)
      return newDate
    })
  }

  
  const canCreateTask = user && ["superadmin", "manager"].includes(user.role)

  return (
    <div className="layout">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="main">
        <TopBar 
          title="Календарь задач"
          onOpenModal={canCreateTask ? () => setIsModalOpen(true) : null} 
        />

        <div className="calendar">
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)}>←</button>
            <h2>
              {currentDate.toLocaleDateString("ru-RU", {
                month: "long",
                year: "numeric"
              })}
            </h2>
            <button onClick={() => changeMonth(1)}>→</button>
          </div>

          <CalendarGrid date={currentDate} tasks={tasks} />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddTask={onAddTask}
          onEditTask={() => {}}
        />
      </main>
    </div>
  )
}
