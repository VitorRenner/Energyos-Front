import { BatteryCharging, Factory, Gauge, Home, Zap } from "lucide-react";

export default function PowerFlowCard({ power, voltage, current, href }) {
  return (
    <article className="power-flow-card">
      <a className="panel-heading panel-heading-link" href={href} aria-label="Abrir detalhe de rede, medidor e carga">
        <div>
          <p className="panel-kicker">Fluxo elétrico</p>
          <h2>Rede, medidor e carga</h2>
        </div>
        <Zap size={19} aria-hidden="true" />
      </a>

      <div className="flow-map" aria-label="Fluxo de energia em tempo real">
        <a className="flow-node source data-link" href="#/dados/rede-ac">
          <Factory size={24} aria-hidden="true" />
          <span>Rede</span>
        </a>
        <div className="flow-line">
          <i />
        </div>
        <a className="flow-node meter data-link" href="#/dados/medidor-pzem">
          <Gauge size={28} aria-hidden="true" />
          <strong>{power} W</strong>
          <small>{voltage} V / {current} A</small>
        </a>
        <div className="flow-line">
          <i />
        </div>
        <a className="flow-node load data-link" href="#/dados/cargas">
          <Home size={24} aria-hidden="true" />
          <span>Cargas</span>
        </a>
      </div>

      <div className="flow-stats">
        <a href="#/dados/medidor-pzem">
          <BatteryCharging size={16} aria-hidden="true" />
          PZEM-004T calibrado
        </a>
        <a href="#/dados/atualizacao">Atualização 1s</a>
      </div>
    </article>
  );
}
