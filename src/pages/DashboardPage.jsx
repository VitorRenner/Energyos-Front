import {
  Activity,
  BadgeDollarSign,
  BatteryCharging,
  CircleGauge,
  PlugZap,
  Radio,
  TimerReset,
  Waves,
  Zap,
} from "lucide-react";
import AlertCenter from "../components/AlertCenter.jsx";
import ConsumptionInsights from "../components/ConsumptionInsights.jsx";
import DeviceStatusPanel from "../components/DeviceStatusPanel.jsx";
import PowerFlowCard from "../components/PowerFlowCard.jsx";
import RealTimeMetricCard from "../components/RealTimeMetricCard.jsx";
import SkeletonPanel from "../components/SkeletonPanel.jsx";
import EnergyChart from "../charts/EnergyChart.jsx";
import { useEnergyTelemetry } from "../hooks/useEnergyTelemetry.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { formatCurrency, formatNumber } from "../utils/formatters.js";

export default function DashboardPage() {
  const { telemetry, isLoading, adapters } = useEnergyTelemetry();
  const { metrics, series } = telemetry;
  const sparkline = series.power.map((point) => point.value);

  const cards = [
    {
      icon: Zap,
      label: "Tensão",
      href: "#/metricas/tensao",
      value: formatNumber(metrics.voltage),
      unit: "V",
      helper: "Rede dentro da faixa",
      status: metrics.voltage > 230 || metrics.voltage < 208 ? "warning" : "normal",
    },
    {
      icon: Activity,
      label: "Corrente",
      href: "#/metricas/corrente",
      value: formatNumber(metrics.current),
      unit: "A",
      helper: "Carga ativa",
      status: metrics.current > 9 ? "warning" : "normal",
    },
    {
      icon: PlugZap,
      label: "Potência",
      href: "#/metricas/potencia",
      value: formatNumber(metrics.power, { maximumFractionDigits: 0 }),
      unit: "W",
      helper: "Amostra PZEM",
      status: metrics.power > 1800 ? "danger" : "normal",
    },
    {
      icon: Waves,
      label: "Frequência",
      href: "#/metricas/frequencia",
      value: formatNumber(metrics.frequency, { minimumFractionDigits: 2 }),
      unit: "Hz",
      helper: "Estabilidade AC",
      status: "normal",
    },
    {
      icon: TimerReset,
      label: "Consumo diário",
      href: "#/metricas/consumo-diario",
      value: formatNumber(metrics.dailyEnergy),
      unit: "kWh",
      helper: "Ciclo atual",
      status: "normal",
      trend: "down",
    },
    {
      icon: BatteryCharging,
      label: "Consumo mensal",
      href: "#/metricas/consumo-mensal",
      value: formatNumber(metrics.monthlyEnergy),
      unit: "kWh",
      helper: "Bucket InfluxDB",
      status: "normal",
    },
    {
      icon: BadgeDollarSign,
      label: "Custo estimado",
      href: "#/metricas/custo-estimado",
      value: formatCurrency(metrics.monthlyCost),
      unit: "",
      helper: "Tarifa configurada",
      status: "normal",
    },
    {
      icon: CircleGauge,
      label: "Eficiência",
      href: "#/metricas/eficiencia",
      value: metrics.efficiency,
      unit: "%",
      helper: "Perfil energético",
      status: metrics.efficiency < 88 ? "warning" : "normal",
    },
  ];

  return (
    <DashboardLayout telemetry={telemetry} adapters={adapters}>
      <main className="dashboard" id="top">
        <section className="hero-console">
          <div className="hero-copy">
            <p className="eyebrow">ESP32 + PZEM-004T + MQTT + InfluxDB</p>
            <h1>Monitoramento energético inteligente em tempo real</h1>
            <p>
              Centro de controle para telemetria elétrica, eventos operacionais,
              histórico time-series e diagnóstico IoT de uma infraestrutura ativa.
            </p>
            <div className="adapter-row" aria-label="Interfaces preparadas">
              <span>REST: {adapters.rest}</span>
              <span>WebSocket ready</span>
              <span>{adapters.storage}</span>
            </div>
          </div>

          <div className="hero-metrics" aria-label="Métricas principais em tempo real">
            <a className="primary-reading data-link" href="#/dados/potencia">
              <span>Consumo atual</span>
              <strong>{formatNumber(metrics.power, { maximumFractionDigits: 0 })}</strong>
              <small>watts</small>
            </a>
            <div className="reading-grid">
              <a href="#/dados/tensao">
                <strong>{formatNumber(metrics.voltage)}</strong>
                V
              </a>
              <a href="#/dados/corrente">
                <strong>{formatNumber(metrics.current)}</strong>
                A
              </a>
              <a href="#/dados/energia-total">
                <strong>{formatNumber(metrics.totalEnergy)}</strong>
                kWh total
              </a>
              <a href="#/dados/custo-estimado">
                <strong>{formatCurrency(metrics.monthlyCost)}</strong>
                mês
              </a>
            </div>
            <a className="last-reading data-link" href="#/dados/atualizacao">
              <Radio size={15} aria-hidden="true" />
              Última leitura: {telemetry.system.lastReading}
            </a>
          </div>
        </section>

        {isLoading ? (
          <SkeletonPanel />
        ) : (
          <section className="metric-grid" aria-label="Cards inteligentes">
            {cards.map((card) => (
              <RealTimeMetricCard key={card.label} {...card} sparkline={sparkline} />
            ))}
          </section>
        )}

        <section className="operations-grid">
          <PowerFlowCard
            href="#/sessoes/rede-medidor-carga"
            power={formatNumber(metrics.power, { maximumFractionDigits: 0 })}
            voltage={formatNumber(metrics.voltage)}
            current={formatNumber(metrics.current)}
          />
          <EnergyChart
            title="Potência em tempo real"
            subtitle="Amostragem MQTT"
            series={series.power}
            metric="Watts"
            tone="power"
            href="#/sessoes/potencia-tempo-real"
          />
        </section>

        <section className="chart-grid">
          <EnergyChart
            title="Histórico de consumo"
            subtitle="InfluxDB time-series"
            series={series.consumption}
            metric="kWh"
            tone="energy"
            type="bar"
            href="#/sessoes/historico-consumo"
          />
          <EnergyChart
            title="Comparação mensal"
            subtitle="Baseline vs uso atual"
            series={series.comparison}
            metric="kWh"
            tone="compare"
            type="bar"
            href="#/sessoes/comparacao-mensal"
          />
          <EnergyChart
            title="Perfil diário"
            subtitle="Consumo por janela"
            series={series.daily}
            metric="kWh"
            tone="power"
            href="#/sessoes/perfil-diario"
          />
        </section>

        <section className="intel-grid">
          <AlertCenter alerts={telemetry.alerts} href="#/sessoes/central-alertas" />
          <DeviceStatusPanel device={telemetry.device} href="#/sessoes/camada-iot" />
        </section>

        <ConsumptionInsights insights={telemetry.insights} href="#/sessoes/insights-consumo" />
      </main>
    </DashboardLayout>
  );
}
