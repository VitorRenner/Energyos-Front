import { Cpu, Router, Signal, Thermometer, Timer, Workflow } from "lucide-react";

const items = [
  { key: "wifi", label: "Wi-Fi RSSI", unit: "dBm", icon: Signal, href: "#/dados/wifi-rssi" },
  { key: "ip", label: "IP do ESP32", unit: "", icon: Router, href: "#/dados/ip-esp32" },
  { key: "mqttLatency", label: "Latência MQTT", unit: "ms", icon: Workflow, href: "#/dados/latencia-mqtt" },
  { key: "hardwareUptime", label: "Uptime hardware", unit: "", icon: Timer, href: "#/dados/uptime-hardware" },
  { key: "refreshRate", label: "Taxa de leitura", unit: "", icon: Cpu, href: "#/dados/taxa-leitura" },
  { key: "temperature", label: "Temperatura", unit: "C", icon: Thermometer, href: "#/dados/temperatura" },
];

export default function DeviceStatusPanel({ device, href }) {
  return (
    <article className="device-panel">
      <a className="panel-heading panel-heading-link" href={href} aria-label="Abrir detalhe da camada IoT">
        <div>
          <p className="panel-kicker">Camada IoT</p>
          <h2>{device.name}</h2>
        </div>
        <span className="firmware-chip">{device.firmware}</span>
      </a>

      <div className="device-grid">
        {items.map(({ key, label, unit, icon: Icon, href: itemHref }) => (
          <a className="device-item data-link" href={itemHref} key={key}>
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
            <strong>
              {device[key]}
              {unit ? ` ${unit}` : ""}
            </strong>
          </a>
        ))}
      </div>
    </article>
  );
}
