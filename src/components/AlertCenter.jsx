import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, WifiOff } from "lucide-react";

const priorityIcon = {
  alta: ShieldAlert,
  media: AlertTriangle,
  info: CheckCircle2,
};

const statusLabel = {
  active: "ativo",
  resolved: "resolvido",
};

export default function AlertCenter({ alerts, href }) {
  return (
    <article className="alert-center">
      <a className="panel-heading panel-heading-link" href={href} aria-label="Abrir detalhe da central de alertas">
        <div>
          <p className="panel-kicker">Eventos operacionais</p>
          <h2>Central de alertas</h2>
        </div>
        <WifiOff size={19} aria-hidden="true" />
      </a>

      <div className="alert-list">
        {alerts.map((alert) => {
          const Icon = priorityIcon[alert.priority] ?? AlertTriangle;

          return (
            <a className={`alert-item data-link ${alert.priority}`} href={`#/dados/alerta-${alert.id}`} key={alert.id}>
              <span className="alert-icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <div className="alert-title-row">
                  <strong>{alert.title}</strong>
                  <span>{alert.priority}</span>
                </div>
                <p>{alert.description}</p>
                <small>
                  <Clock size={13} aria-hidden="true" />
                  {alert.time} - {statusLabel[alert.status] ?? alert.status}
                </small>
              </div>
            </a>
          );
        })}
      </div>
    </article>
  );
}
