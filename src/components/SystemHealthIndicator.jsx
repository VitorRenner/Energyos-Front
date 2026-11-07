import { Activity, Cpu, RadioTower, Server } from "lucide-react";

const icons = {
  system: Activity,
  mqtt: RadioTower,
  esp32: Cpu,
  uptime: Server,
};

const valueLabels = {
  operational: "Operacional",
  online: "Online",
  degraded: "Degradado",
  syncing: "Sincronizando",
  offline: "Offline",
};

export default function SystemHealthIndicator({ label, value, variant = "system", detail, href }) {
  const Icon = icons[variant] ?? Activity;
  const stateClass = String(value).toLowerCase();
  const Component = href ? "a" : "div";

  return (
    <Component className={`health-pill data-link ${stateClass}`} href={href}>
      <Icon size={16} aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        <small>{detail ?? valueLabels[value] ?? value}</small>
      </span>
    </Component>
  );
}
