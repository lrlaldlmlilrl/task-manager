export default function TopBar({ onOpenModal, title = "Доска задач" }) {
  return (
    <div className="topbar">
      <h2>{title}</h2>

      {onOpenModal && (
        <button className="add-board-btn" onClick={onOpenModal}>
          + Задача
        </button>
      )}
    </div>
  )
}
