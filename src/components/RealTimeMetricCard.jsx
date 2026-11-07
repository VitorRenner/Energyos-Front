import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function RealTimeMetricCard({
  icon: Icon,
  label,
  value,
  unit,
  status = "normal",
  trend = "up",
  sparkline = [],
  helper,
  href,
}) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;
  const max = Math.max(...sparkline, 1);
  const Component = href ? "a" : "article";

  return (
    <Component className={`metric-card ${status}`} href={href} aria-label={href ? `Abrir página de ${label}` : undefined}>
      <div className="metric-topline">
        <span className="metric-icon">
          <Icon size={19} aria-hidden="true" />
        </span>
        <span className={`status-dot ${status}`} />
      </div>
      <p>{label}</p>
      <div className="metric-value">
        <strong>{value}</strong>
        <span>{unit}</span>
      </div>
      <div className="metric-footer">
        <span>
          <TrendIcon size={14} aria-hidden="true" />
          {helper}
        </span>
        <div className="mini-bars" aria-hidden="true">
          {sparkline.slice(-10).map((item, index) => (
            <i key={`${label}-${index}`} style={{ height: `${22 + (item / max) * 58}%` }} />
          ))}
        </div>
      </div>
    </Component>
  );
}
