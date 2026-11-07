import { BrainCircuit, TrendingDown, TrendingUp, Waves } from "lucide-react";

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Waves,
};

const insightLinks = ["#/dados/previsao-mensal", "#/dados/maior-consumo", "#/dados/media-diaria", "#/dados/desperdicio-provavel"];

export default function ConsumptionInsights({ insights, href }) {
  return (
    <article className="insights-panel">
      <a className="panel-heading panel-heading-link" href={href} aria-label="Abrir detalhe de insights de consumo">
        <div>
          <p className="panel-kicker">Análise inteligente</p>
          <h2>Insights de consumo</h2>
        </div>
        <BrainCircuit size={19} aria-hidden="true" />
      </a>

      <div className="insight-grid">
        {insights.map((insight, index) => {
          const Icon = trendIcons[insight.trend] ?? Waves;

          return (
            <a className={`insight-card data-link ${insight.trend}`} href={insightLinks[index] ?? `#/dados/insight-${index + 1}`} key={insight.label}>
              <Icon size={18} aria-hidden="true" />
              <span>{insight.label}</span>
              <strong>{insight.value}</strong>
              <p>{insight.detail}</p>
            </a>
          );
        })}
      </div>
    </article>
  );
}
