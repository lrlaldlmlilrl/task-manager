export default function KPIBlock({ title, value, danger, icon }) {
  return (
    <div className={`kpi ${danger ? "danger" : ""}`}>
      {icon && <div className="kpi-icon">{icon}</div>}
      <div className="kpi-content">
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  )
}
