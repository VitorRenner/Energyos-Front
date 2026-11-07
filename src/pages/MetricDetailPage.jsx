import {
  Activity,
  BadgeDollarSign,
  BatteryCharging,
  CircleGauge,
  Gauge,
  PlugZap,
  TimerReset,
  Waves,
  Zap,
} from "lucide-react";
import EnergyChart from "../charts/EnergyChart.jsx";
import { useEnergyTelemetry } from "../hooks/useEnergyTelemetry.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { formatCurrency, formatNumber } from "../utils/formatters.js";

const makeRangeSeries = (series, factor = 1, precision = 1) =>
  series.map((point, index) => ({
    label: point.label,
    value: Number(Math.max(0, point.value * factor + Math.sin(index / 2) * factor * 4).toFixed(precision)),
  }));

const dataRouteByLabel = {
  "tensao": "tensao",
  "corrente": "corrente",
  "potencia": "potencia",
  "potencia aparente": "potencia",
  "frequencia": "frequencia",
  "energia total": "energia-total",
  "consumo diario": "consumo-diario",
  "consumo mensal": "consumo-mensal",
  "custo atual": "custo-estimado",
  "custo estimado": "custo-estimado",
  "tarifa media": "custo-estimado",
  "eficiencia": "eficiencia",
  "indice atual": "eficiencia",
  "latencia mqtt": "latencia-mqtt",
  "temperatura do modulo": "temperatura",
  "ultima leitura": "atualizacao",
  "fonte": "rede-ac",
  "sensor": "medidor-pzem",
  "carga instantanea": "cargas",
  "janela critica": "consumo-diario",
  "baseline": "consumo-mensal",
};

const normalizeLabel = (label) =>
  String(label)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const dataHrefFor = (label, fallbackId) => `#/dados/${dataRouteByLabel[normalizeLabel(label)] ?? fallbackId}`;

function buildMetricPages(telemetry) {
  const { metrics, series, device } = telemetry;
  const voltageSeries = makeRangeSeries(series.power, metrics.voltage / Math.max(metrics.power, 1), 1);
  const currentSeries = makeRangeSeries(series.power, metrics.current / Math.max(metrics.power, 1), 2);
  const frequencySeries = series.power.map((point, index) => ({
    label: point.label,
    value: Number((metrics.frequency + Math.sin(index / 3) * 0.05).toFixed(2)),
  }));
  const costSeries = makeRangeSeries(series.comparison, metrics.monthlyCost / Math.max(metrics.monthlyEnergy, 1), 2);
  const efficiencySeries = series.daily.map((point, index) => ({
    label: point.label,
    value: Math.min(99, Math.max(82, Math.round(metrics.efficiency - 4 + Math.sin(index / 2) * 5))),
  }));

  return [
    {
      id: "tensao",
      title: "Tensão",
      icon: Zap,
      value: formatNumber(metrics.voltage),
      unit: "V",
      subtitle: "Qualidade da rede elétrica",
      summary: "Acompanha a estabilidade da tensão e ajuda a identificar quedas, picos e variações fora da faixa ideal.",
      stats: [
        ["Faixa ideal", "208 - 230 V"],
        ["Mínimo estimado", `${formatNumber(Math.min(...voltageSeries.map((item) => item.value)))} V`],
        ["Máximo estimado", `${formatNumber(Math.max(...voltageSeries.map((item) => item.value)))} V`],
        ["Status", metrics.voltage > 230 || metrics.voltage < 208 ? "Atenção" : "Normal"],
      ],
      chart: { title: "Variação de tensão", subtitle: "Amostras recentes", series: voltageSeries, metric: "Volts" },
      table: [
        ["Desvio atual", `${formatNumber(Math.abs(metrics.voltage - 220))} V`],
        ["Risco de subtensao", metrics.voltage < 208 ? "Elevado" : "Baixo"],
        ["Última leitura", telemetry.system.lastReading],
      ],
    },
    {
      id: "corrente",
      title: "Corrente",
      icon: Activity,
      value: formatNumber(metrics.current),
      unit: "A",
      subtitle: "Carga ativa no circuito",
      summary: "Mostra a corrente solicitada pelos equipamentos e evidencia aumento de carga em tempo real.",
      stats: [
        ["Média recente", `${formatNumber(metrics.current * 0.94)} A`],
        ["Pico recente", `${formatNumber(Math.max(...currentSeries.map((item) => item.value)))} A`],
        ["Carga instantânea", metrics.current > 9 ? "Alta" : "Moderada"],
        ["Sensor", "PZEM-004T"],
      ],
      chart: { title: "Corrente em tempo real", subtitle: "Carga por minuto", series: currentSeries, metric: "Amperes" },
      table: [
        ["Corrente por kW", `${formatNumber(metrics.current / Math.max(metrics.power / 1000, 1))} A/kW`],
        ["Latência MQTT", `${device.mqttLatency} ms`],
        ["Temperatura do módulo", `${formatNumber(device.temperature)} C`],
      ],
    },
    {
      id: "potencia",
      title: "Potência",
      icon: PlugZap,
      value: formatNumber(metrics.power, { maximumFractionDigits: 0 }),
      unit: "W",
      subtitle: "Demanda instantânea",
      summary: "Concentra a leitura de consumo no momento, útil para detectar picos e comportamento anormal de carga.",
      stats: [
        ["Média recente", `${formatNumber(metrics.power * 0.92, { maximumFractionDigits: 0 })} W`],
        ["Pico operacional", `${formatNumber(Math.max(...series.power.map((item) => item.value)), { maximumFractionDigits: 0 })} W`],
        ["Limite de alerta", "1800 W"],
        ["Status", metrics.power > 1800 ? "Crítico" : "Controlado"],
      ],
      chart: { title: "Potência em tempo real", subtitle: "Amostragem MQTT", series: series.power, metric: "Watts" },
      table: [
        ["Potência aparente", `${formatNumber(metrics.voltage * metrics.current, { maximumFractionDigits: 0 })} VA`],
        ["Fator estimado", `${formatNumber(metrics.power / Math.max(metrics.voltage * metrics.current, 1))}`],
        ["Última leitura", telemetry.system.lastReading],
      ],
    },
    {
      id: "frequencia",
      title: "Frequência",
      icon: Waves,
      value: formatNumber(metrics.frequency, { minimumFractionDigits: 2 }),
      unit: "Hz",
      subtitle: "Estabilidade AC",
      summary: "Monitora a frequência da rede para indicar estabilidade do fornecimento e oscilações elétricas.",
      stats: [
        ["Referência", "60.00 Hz"],
        ["Desvio", `${formatNumber(Math.abs(metrics.frequency - 60), { minimumFractionDigits: 2 })} Hz`],
        ["Mínimo recente", `${formatNumber(Math.min(...frequencySeries.map((item) => item.value)), { minimumFractionDigits: 2 })} Hz`],
        ["Máximo recente", `${formatNumber(Math.max(...frequencySeries.map((item) => item.value)), { minimumFractionDigits: 2 })} Hz`],
      ],
      chart: { title: "Oscilação de frequência", subtitle: "Estabilidade da rede", series: frequencySeries, metric: "Hz" },
      table: [
        ["Jitter estimado", "0.05 Hz"],
        ["Condição", Math.abs(metrics.frequency - 60) > 0.2 ? "Observar" : "Estável"],
        ["Fonte", "Rede AC"],
      ],
    },
    {
      id: "consumo-diario",
      title: "Consumo diário",
      icon: TimerReset,
      value: formatNumber(metrics.dailyEnergy),
      unit: "kWh",
      subtitle: "Ciclo atual",
      summary: "Resume o consumo acumulado no dia e mostra em quais janelas a demanda aumenta.",
      stats: [
        ["Hoje", `${formatNumber(metrics.dailyEnergy)} kWh`],
        ["Média de 7 dias", "13,4 kWh"],
        ["Projeção do dia", `${formatNumber(metrics.dailyEnergy * 1.08)} kWh`],
        ["Janela crítica", "18:00 - 21:00"],
      ],
      chart: { title: "Perfil diário", subtitle: "Consumo por janela", series: series.daily, metric: "kWh" },
      type: "bar",
      table: [
        ["Carga fantasma", "1,8 kWh/dia"],
        ["Economia possível", "12%"],
        ["Ciclo", "00:00 - 23:59"],
      ],
    },
    {
      id: "consumo-mensal",
      title: "Consumo mensal",
      icon: BatteryCharging,
      value: formatNumber(metrics.monthlyEnergy),
      unit: "kWh",
      subtitle: "Acumulado do mês",
      summary: "Mostra a evolução mensal e compara o uso atual com o histórico de referência.",
      stats: [
        ["Mês atual", `${formatNumber(metrics.monthlyEnergy)} kWh`],
        ["Baseline", "350 kWh"],
        ["Tendência", metrics.monthlyEnergy > 350 ? "Acima" : "Abaixo"],
        ["Dias restantes", "8"],
      ],
      chart: { title: "Comparação mensal", subtitle: "Baseline vs uso atual", series: series.comparison, metric: "kWh" },
      type: "bar",
      table: [
        ["Previsão final", `${formatNumber(metrics.monthlyEnergy * 1.12)} kWh`],
        ["Melhor periodo", "Madrugada"],
        ["Fonte histórica", "InfluxDB"],
      ],
    },
    {
      id: "custo-estimado",
      title: "Custo estimado",
      icon: BadgeDollarSign,
      value: formatCurrency(metrics.monthlyCost),
      unit: "",
      subtitle: "Tarifa configurada",
      summary: "Converte consumo em custo projetado para acompanhar impacto financeiro antes do fechamento da fatura.",
      stats: [
        ["Custo atual", formatCurrency(metrics.monthlyCost)],
        ["Previsão mensal", "R$ 312,80"],
        ["Tarifa média", "R$ 0,88/kWh"],
        ["Margem do limite", "8,9%"],
      ],
      chart: { title: "Evolução de custo", subtitle: "Estimativa por período", series: costSeries, metric: "R$" },
      type: "bar",
      table: [
        ["Maior impacto", "Climatização"],
        ["Economia prevista", "R$ 27,40"],
        ["Modelo", "Consumo x tarifa"],
      ],
    },
    {
      id: "eficiencia",
      title: "Eficiência",
      icon: CircleGauge,
      value: metrics.efficiency,
      unit: "%",
      subtitle: "Perfil energético",
      summary: "Combina consumo, perdas prováveis e estabilidade para indicar a qualidade do uso de energia.",
      stats: [
        ["Índice atual", `${metrics.efficiency}%`],
        ["Meta", "92%"],
        ["Perda provável", `${100 - metrics.efficiency}%`],
        ["Classificação", metrics.efficiency >= 92 ? "Ótima" : "Ajustar"],
      ],
      chart: { title: "Índice de eficiência", subtitle: "Qualidade operacional", series: efficiencySeries, metric: "%" },
      table: [
        ["Desperdício provável", "1,8 kWh/dia"],
        ["Ações sugeridas", "3"],
        ["Confiança", "Alta"],
      ],
    },
  ];
}

export default function MetricDetailPage({ metricId }) {
  const { telemetry, adapters } = useEnergyTelemetry();
  const pages = buildMetricPages(telemetry);
  const page = pages.find((item) => item.id === metricId) ?? pages[0];
  const Icon = page.icon;

  return (
    <DashboardLayout telemetry={telemetry} adapters={adapters}>
      <main className="dashboard metric-detail-page" id="top">
        <nav className="metric-nav" aria-label="Páginas de métricas">
          <a href="#/">Dashboard</a>
          {pages.map((item) => (
            <a key={item.id} className={item.id === page.id ? "active" : ""} href={`#/metricas/${item.id}`}>
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
          <a className="metric-detail-reading data-link" href={`#/dados/${page.id}`}>
            <span>Leitura atual</span>
            <strong>{page.value}</strong>
            <small>{page.unit}</small>
          </a>
        </section>

        <section className="detail-stat-grid" aria-label="Outras estatísticas">
          {page.stats.map(([label, value]) => (
            <a className="detail-stat-card data-link" href={dataHrefFor(label, page.id)} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </a>
          ))}
        </section>

        <section className="metric-detail-grid">
          <EnergyChart {...page.chart} type={page.type} tone={page.type === "bar" ? "energy" : "power"} href={`#/dados/${page.id}`} />
          <article className="metric-breakdown-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Diagnóstico</p>
                <h2>Leituras complementares</h2>
              </div>
              <Gauge size={20} aria-hidden="true" />
            </div>
            <div className="breakdown-list">
              {page.table.map(([label, value]) => (
                <a href={dataHrefFor(label, page.id)} key={label}>
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
