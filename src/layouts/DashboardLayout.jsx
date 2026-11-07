import MQTTConnectionStatus from "../components/MQTTConnectionStatus.jsx";
import SystemHealthIndicator from "../components/SystemHealthIndicator.jsx";

export default function DashboardLayout({ telemetry, adapters, children }) {
  return (
    <div className="app-shell">
      <header className="control-header">
        <a className="brand" href="#/" aria-label="EnergyOS">
          <span className="brand-mark">E</span>
          <span>
            <strong>EnergyOS</strong>
            <small>IoT Energy Control</small>
          </span>
        </a>

        <div className="header-health" aria-label="Status geral do sistema">
          <SystemHealthIndicator label="Sistema" value={telemetry.system.status} detail="Operacional" href="#/dados/sistema" />
          <SystemHealthIndicator label="ESP32" value={telemetry.system.esp32} variant="esp32" href="#/dados/esp32" />
          <SystemHealthIndicator label="Uptime" value={telemetry.system.uptime} variant="uptime" href="#/dados/uptime" />
        </div>

        <MQTTConnectionStatus status={telemetry.system.mqtt} topic={adapters.mqttTopic} />
      </header>

      {children}
    </div>
  );
}
