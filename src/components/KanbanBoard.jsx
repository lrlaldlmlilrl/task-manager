import Column from "./Column"

export default function KanbanBoard({ tasks, onChangeStatus, onDelete, onEdit }) {
  return (
    <div className="kanban">
      <Column 
        title="Новые" 
        status="todo" 
        tasks={tasks} 
        onChangeStatus={onChangeStatus} 
        onDelete={onDelete} 
        onEdit={onEdit}
      />
      <Column 
        title="В работе" 
        status="inProgress" 
        tasks={tasks} 
        onChangeStatus={onChangeStatus} 
        onDelete={onDelete} 
        onEdit={onEdit}
      />
      <Column 
        title="Готово" 
        status="done" 
        tasks={tasks} 
        onChangeStatus={onChangeStatus} 
        onDelete={onDelete} 
        onEdit={onEdit}
      />
    </div>
  )
}
