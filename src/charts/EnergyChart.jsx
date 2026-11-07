import { Bar, Line } from "react-chartjs-2";
import "./chartConfig.js";
import { baseChartOptions } from "./chartConfig.js";

const palettes = {
  power: {
    border: "#38bdf8",
    background: "rgba(56, 189, 248, 0.14)",
    point: "#facc15",
  },
  energy: {
    border: "#facc15",
    background: "rgba(250, 204, 21, 0.16)",
    point: "#38bdf8",
  },
  compare: {
    border: "#22c55e",
    background: "rgba(34, 197, 94, 0.2)",
    point: "#22c55e",
  },
};

export default function EnergyChart({
  title,
  subtitle,
  series,
  type = "line",
  tone = "power",
  metric,
  href,
}) {
  const palette = palettes[tone] ?? palettes.power;
  const Component = type === "bar" ? Bar : Line;
  const Panel = href ? "a" : "article";

  const data = {
    labels: series.map((point) => point.label),
    datasets: [
      {
        label: metric,
        data: series.map((point) => point.value),
        borderColor: palette.border,
        backgroundColor: palette.background,
        pointBackgroundColor: palette.point,
        pointBorderWidth: 0,
        pointRadius: type === "bar" ? 0 : 2,
        pointHoverRadius: 5,
        borderWidth: 2,
        tension: 0.42,
        fill: type !== "bar",
        borderRadius: type === "bar" ? 8 : 0,
        barThickness: type === "bar" ? 16 : undefined,
      },
    ],
  };

  return (
    <Panel className="chart-panel panel-link" href={href} aria-label={href ? `Abrir detalhe de ${title}` : undefined}>
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">{subtitle}</p>
          <h2>{title}</h2>
        </div>
        <span className="live-chip">Live</span>
      </div>
      <div className="chart-frame">
        <Component data={data} options={baseChartOptions} />
      </div>
    </Panel>
  );
}
