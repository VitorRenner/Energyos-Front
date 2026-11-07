import {
  AlertTriangle,
  BrainCircuit,
  Cpu,
  Factory,
  Gauge,
  PlugZap,
  Radio,
  Router,
  Signal,
  TimerReset,
  Workflow,
} from "lucide-react";
import EnergyChart from "../charts/EnergyChart.jsx";
import { useEnergyTelemetry } from "../hooks/useEnergyTelemetry.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { formatCurrency, formatNumber } from "../utils/formatters.js";

const statusLabel = {
  active: "ativo",
  resolved: "resolvido",
  online: "online",
  degraded: "degradado",
  syncing: "sincronizando",
  operational: "operacional",
};

const dataRouteByLabel = {
  "rede": "rede-ac",
  "rede, medidor e carga": "medidor-pzem",
  "potencia em tempo real": "potencia",
  "historico de consumo": "energia-total",
  "comparacao mensal": "consumo-mensal",
  "perfil diario": "consumo-diario",
  "central de alertas": "alerta-1",
  "camada iot": "wifi-rssi",
  "insights de consumo": "previsao-mensal",
  "medidor": "medidor-pzem",
  "carga ativa": "cargas",
  "atualizacao": "atualizacao",
  "potencia aparente": "potencia",
  "energia total": "energia-total",
  "status operacional": "sistema",
  "media recente": "potencia",
  "pico da serie": "potencia",
  "latencia": "latencia-mqtt",
  "latencia mqtt": "latencia-mqtt",
  "custo instantaneo": "custo-estimado",
  "ultima leitura": "atualizacao",
  "total acumulado": "energia-total",
  "consumo diario": "consumo-diario",
  "consumo mensal": "consumo-mensal",
  "media da serie": "historico-consumo",
  "mes atual": "consumo-mensal",
  "custo atual": "custo-estimado",
  "previsao": "consumo-mensal",
  "tarifa media": "custo-estimado",
  "hoje": "consumo-diario",
  "media de 7 dias": "media-diaria",
  "janela critica": "consumo-diario",
  "carga fantasma": "desperdicio-provavel",
  "economia possivel": "eficiencia",
  "alertas ativos": "alerta-1",
  "prioridade alta": "alerta-1",
  "ultimo evento": "alerta-1",
  "wi-fi rssi": "wifi-rssi",
  "ip do esp32": "ip-esp32",
  "uptime hardware": "uptime-hardware",
  "taxa de leitura": "taxa-leitura",
  "temperatura": "temperatura",
  "firmware": "firmware",
  "status mqtt": "mqtt",
  "status esp32": "esp32",
  "uptime do sistema": "uptime",
  "conexao": "mqtt",
  "sinal": "wifi-rssi",
};

const normalizeLabel = (label) =>
  String(label)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const dataHrefFor = (label, fallbackId = "sistema") => `#/dados/${dataRouteByLabel[normalizeLabel(label)] ?? fallbackId}`;

function buildSectionPages(telemetry) {
  const { metrics, series, device, alerts, insights, system } = telemetry;
  const activeAlerts = alerts.filter((alert) => alert.status === "active").length;
  const highAlerts = alerts.filter((alert) => alert.priority === "alta").length;
  const iotRows = [
    ["Wi-Fi RSSI", `${device.wifi} dBm`],
    ["IP do ESP32", device.ip],
    ["Latência MQTT", `${device.mqttLatency} ms`],
    ["Uptime hardware", device.hardwareUptime],
    ["Taxa de leitura", device.refreshRate],
    ["Temperatura", `${formatNumber(device.temperature)} C`],
    ["Firmware", device.firmware],
    ["Status MQTT", statusLabel[system.mqtt] ?? system.mqtt],
    ["Status ESP32", statusLabel[system.esp32] ?? system.esp32],
    ["Uptime do sistema", system.uptime],
    ["Última leitura", system.lastReading],
    ["Banco histórico", "InfluxDB time-series"],
  ];

  return [
    {
      id: "rede-medidor-carga",
      title: "Rede, medidor e carga",
      subtitle: "Fluxo elétrico",
      icon: Factory,
      summary: "Visualiza a cadeia completa entre rede AC, medidor PZEM-004T e cargas conectadas para validar fluxo, estabilidade e demanda.",
      primary: `${formatNumber(metrics.power, { maximumFractionDigits: 0 })} W`,
      stats: [
        ["Rede", `${formatNumber(metrics.voltage)} V / ${formatNumber(metrics.frequency, { minimumFractionDigits: 2 })} Hz`],
        ["Medidor", "PZEM-004T calibrado"],
        ["Carga ativa", `${formatNumber(metrics.current)} A`],
        ["Atualização", "1s"],
      ],
      chart: { title: "Demanda na carga", subtitle: "Amostras do medidor", series: series.power, metric: "Watts", tone: "power" },
      rows: [
        ["Potência aparente", `${formatNumber(metrics.voltage * metrics.current, { maximumFractionDigits: 0 })} VA`],
        ["Energia total", `${formatNumber(metrics.totalEnergy)} kWh`],
        ["Status operacional", statusLabel[system.status] ?? system.status],
      ],
    },
    {
      id: "potencia-tempo-real",
      title: "Potência em tempo real",
      subtitle: "Amostragem MQTT",
      icon: PlugZap,
      summary: "Acompanha a potência instantânea enviada pelo ESP32 e destaca picos que podem indicar sobrecarga ou uso fora do padrão.",
      primary: `${formatNumber(metrics.power, { maximumFractionDigits: 0 })} W`,
      stats: [
        ["Média recente", `${formatNumber(metrics.power * 0.92, { maximumFractionDigits: 0 })} W`],
        ["Pico da série", `${formatNumber(Math.max(...series.power.map((item) => item.value)), { maximumFractionDigits: 0 })} W`],
        ["Limite de alerta", "1800 W"],
        ["Latência", `${device.mqttLatency} ms`],
      ],
      chart: { title: "Potência em tempo real", subtitle: "Amostragem MQTT", series: series.power, metric: "Watts", tone: "power" },
      rows: [
        ["Fator estimado", formatNumber(metrics.power / Math.max(metrics.voltage * metrics.current, 1))],
        ["Custo instantâneo", `${formatCurrency(metrics.power * 0.00082)}/h`],
        ["Última leitura", system.lastReading],
      ],
    },
    {
      id: "historico-consumo",
      title: "Histórico de consumo",
      subtitle: "InfluxDB time-series",
      icon: TimerReset,
      summary: "Consolida leituras históricas para encontrar janelas de maior uso, tendência de consumo e anomalias recorrentes.",
      primary: `${formatNumber(metrics.totalEnergy)} kWh`,
      stats: [
        ["Total acumulado", `${formatNumber(metrics.totalEnergy)} kWh`],
        ["Consumo diário", `${formatNumber(metrics.dailyEnergy)} kWh`],
        ["Média da série", `${formatNumber(series.consumption.reduce((sum, item) => sum + item.value, 0) / series.consumption.length)} kWh`],
        ["Origem", "InfluxDB"],
      ],
      chart: { title: "Histórico de consumo", subtitle: "InfluxDB time-series", series: series.consumption, metric: "kWh", tone: "energy", type: "bar" },
      rows: [
        ["Maior ponto", `${formatNumber(Math.max(...series.consumption.map((item) => item.value)))} kWh`],
        ["Menor ponto", `${formatNumber(Math.min(...series.consumption.map((item) => item.value)))} kWh`],
        ["Retenção sugerida", "90 dias"],
      ],
    },
    {
      id: "comparacao-mensal",
      title: "Comparação mensal",
      subtitle: "Baseline vs uso atual",
      icon: Gauge,
      summary: "Compara consumo mensal com uma linha de referência para antecipar desvio de meta e impacto na fatura.",
      primary: `${formatNumber(metrics.monthlyEnergy)} kWh`,
      stats: [
        ["Mês atual", `${formatNumber(metrics.monthlyEnergy)} kWh`],
        ["Baseline", "350 kWh"],
        ["Custo atual", formatCurrency(metrics.monthlyCost)],
        ["Previsão", `${formatNumber(metrics.monthlyEnergy * 1.12)} kWh`],
      ],
      chart: { title: "Comparação mensal", subtitle: "Baseline vs uso atual", series: series.comparison, metric: "kWh", tone: "compare", type: "bar" },
      rows: [
        ["Desvio do baseline", `${formatNumber(metrics.monthlyEnergy - 350)} kWh`],
        ["Tarifa média", "R$ 0,88/kWh"],
        ["Dias restantes", "8"],
      ],
    },
    {
      id: "perfil-diario",
      title: "Perfil diário",
      subtitle: "Consumo por janela",
      icon: Radio,
      summary: "Mostra a distribuição do consumo ao longo do dia e evidencia horários de pico para ajuste de rotina ou automação.",
      primary: `${formatNumber(metrics.dailyEnergy)} kWh`,
      stats: [
        ["Hoje", `${formatNumber(metrics.dailyEnergy)} kWh`],
        ["Média de 7 dias", "13,4 kWh"],
        ["Janela crítica", "18:00 - 21:00"],
        ["Carga fantasma", "1,8 kWh/dia"],
      ],
      chart: { title: "Perfil diário", subtitle: "Consumo por janela", series: series.daily, metric: "kWh", tone: "power" },
      rows: [
        ["Projeção do dia", `${formatNumber(metrics.dailyEnergy * 1.08)} kWh`],
        ["Economia possível", "12%"],
        ["Ciclo", "00:00 - 23:59"],
      ],
    },
    {
      id: "central-alertas",
      title: "Central de alertas",
      subtitle: "Eventos operacionais",
      icon: AlertTriangle,
      summary: "Organiza eventos ativos, resolvidos e informativos para priorizar ações antes que uma anomalia elétrica vire falha.",
      primary: `${activeAlerts} ativos`,
      stats: [
        ["Alertas ativos", activeAlerts],
        ["Prioridade alta", highAlerts],
        ["Resolvidos", alerts.filter((alert) => alert.status === "resolved").length],
        ["Ultimo evento", alerts[0]?.time ?? "-"],
      ],
      chart: { title: "Potência no contexto dos alertas", subtitle: "Correlação operacional", series: series.power, metric: "Watts", tone: "power" },
      rows: alerts.map((alert) => [alert.title, `${alert.priority} - ${statusLabel[alert.status] ?? alert.status} - ${alert.time}`, `#/dados/alerta-${alert.id}`]),
    },
    {
      id: "camada-iot",
      title: "Camada IoT",
      subtitle: "Todos os tipos de dados",
      icon: Cpu,
      summary: "Reúne conectividade, firmware, broker MQTT, hardware, leitura elétrica e armazenamento para diagnóstico completo do dispositivo.",
      primary: device.name,
      stats: [
        ["Conexão", `${statusLabel[system.mqtt] ?? system.mqtt} / ${statusLabel[system.esp32] ?? system.esp32}`],
        ["Sinal", `${device.wifi} dBm`],
        ["Latência", `${device.mqttLatency} ms`],
        ["Temperatura", `${formatNumber(device.temperature)} C`],
      ],
      chart: { title: "Potência recebida via IoT", subtitle: "Payloads MQTT", series: series.power, metric: "Watts", tone: "power" },
      rows: iotRows,
      extraIcons: [Signal, Router, Workflow],
    },
    {
      id: "insights-consumo",
      title: "Insights de consumo",
      subtitle: "Análise inteligente",
      icon: BrainCircuit,
      summary: "Traduz telemetria em recomendações práticas sobre custo, pico de uso, média diária e desperdício provável.",
      primary: insights[0]?.value ?? "-",
      stats: insights.slice(0, 4).map((insight) => [insight.label, insight.value]),
      chart: { title: "Base dos insights", subtitle: "Consumo por janela", series: series.daily, metric: "kWh", tone: "power" },
      rows: insights.map((insight, index) => {
        const ids = ["previsao-mensal", "maior-consumo", "media-diaria", "desperdicio-provavel"];
        return [insight.label, insight.detail, `#/dados/${ids[index] ?? `insight-${index + 1}`}`];
      }),
    },
  ];
}

export default function SectionDetailPage({ sectionId }) {
  const { telemetry, adapters } = useEnergyTelemetry();
  const pages = buildSectionPages(telemetry);
  const page = pages.find((item) => item.id === sectionId) ?? pages[0];
  const Icon = page.icon;
  const fallbackDataId = dataRouteByLabel[normalizeLabel(page.title)] ?? "sistema";

  return (
    <DashboardLayout telemetry={telemetry} adapters={adapters}>
      <main className="dashboard metric-detail-page" id="top">
        <nav className="metric-nav" aria-label="Páginas das seções">
          <a href="#/">Dashboard</a>
          {pages.map((item) => (
            <a key={item.id} className={item.id === page.id ? "active" : ""} href={`#/sessoes/${item.id}`}>
              {item.title}
            </a>
          ))}
        </nav>

        <section className="metric-detail-hero">
          <div className="metric-detail-copy">
            <span className="metric-icon large">
              <Icon size={26} aria-hidden="true" />
            </span>
            <p className="eyebrow">{page.subtitle}</p>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </div>
          <a className="metric-detail-reading section-primary-reading data-link" href={`#/dados/${fallbackDataId}`}>
            <span>Resumo atual</span>
            <strong>{page.primary}</strong>
            <small>{telemetry.system.lastReading}</small>
          </a>
        </section>

        <section className="detail-stat-grid" aria-label="Resumo da seção">
          {page.stats.map(([label, value]) => (
            <a className="detail-stat-card data-link" href={dataHrefFor(label, fallbackDataId)} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </a>
          ))}
        </section>

        <section className="metric-detail-grid">
          <EnergyChart {...page.chart} href={`#/dados/${fallbackDataId}`} />
          <article className="metric-breakdown-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Dados complementares</p>
                <h2>Leituras e contexto</h2>
              </div>
              <Gauge size={20} aria-hidden="true" />
            </div>
            <div className="breakdown-list">
              {page.rows.map(([label, value, href]) => (
                <a href={href ?? dataHrefFor(label, fallbackDataId)} key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </a>
              ))}
            </div>
          </article>
        </section>
      </main>
    </DashboardLayout>
  );
}
