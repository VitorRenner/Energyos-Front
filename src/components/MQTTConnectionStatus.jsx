import { RadioTower } from "lucide-react";

export default function MQTTConnectionStatus({ status, topic }) {
  const online = status === "online";

  return (
    <a className={`mqtt-status data-link ${online ? "online" : "degraded"}`} href="#/dados/mqtt">
      <RadioTower size={18} aria-hidden="true" />
      <div>
        <strong>MQTT {online ? "online" : "degradado"}</strong>
        <span>{topic}</span>
      </div>
    </a>
  );
}
