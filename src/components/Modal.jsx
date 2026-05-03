import { useEffect, useState } from "react"

export default function Modal({ isOpen, onClose, onAddTask, onEditTask, editingTask, users = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: ""
  })

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || "",
        description: editingTask.description || "",
        assignedTo: editingTask.assignedToId || "",
        deadline: editingTask.deadline ? new Date(editingTask.deadline).toISOString().split("T")[0] : ""
      })
    } else {
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        deadline: ""
      })
    }
  }, [editingTask, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert("Введите название задачи")
      return
    }

    const taskData = {
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo || undefined,
      deadline: formData.deadline || undefined,
      status: editingTask ? editingTask.status : "todo"
    }

    try {
      if (editingTask) {
        await onEditTask({
          ...editingTask,
          ...taskData
        })
      } else {
        await onAddTask(taskData)
      }

      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        deadline: ""
      })
      onClose()
    } catch (error) {
      console.error("Ошибка сохранения задачи:", error)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {editingTask ? "Редактировать задачу" : "Создать задачу"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Название задачи"
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Описание задачи (необязательно)"
            rows="3"
          />

          {users.length > 0 && (
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
            >
              <option value="">Не назначено</option>
              {users.filter((user) => user.role !== "superadmin").map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.name || user.login}
                </option>
              ))}
            </select>
          )}

          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            placeholder="Срок выполнения"
          />

          <div className="modal-buttons">
            <button type="submit" className="btn-primary">
              {editingTask ? "Сохранить" : "Создать"}
            </button>

            <button type="button" onClick={onClose} className="btn-secondary">
              Закрыть
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
