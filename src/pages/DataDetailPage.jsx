import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  BatteryCharging,
  BrainCircuit,
  CircleGauge,
  Clock,
  Cpu,
  Factory,
  Gauge,
  PlugZap,
  Radio,
  Router,
  Signal,
  Thermometer,
  Timer,
  TimerReset,
  Waves,
  Workflow,
  Zap,
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

const navItems = [
  ["Tensão", "tensao"],
  ["Corrente", "corrente"],
  ["Potência", "potencia"],
  ["Frequência", "frequencia"],
  ["Consumo diário", "consumo-diario"],
  ["Consumo mensal", "consumo-mensal"],
  ["Camada IoT", "wifi-rssi"],
  ["Alertas", "alerta-1"],
  ["Insights", "previsao-mensal"],
];

const makeRangeSeries = (series, factor = 1, precision = 1) =>
  series.map((point, index) => ({
    label: point.label,
    value: Number(Math.max(0, point.value * factor + Math.sin(index / 2) * factor * 4).toFixed(precision)),
  }));

function page(id, title, icon, value, unit, subtitle, summary, chart, stats, rows) {
  return { id, title, icon, value, unit, subtitle, summary, chart, stats, rows };
}

function buildDataPages(telemetry) {
  const { metrics, series, device, system, alerts, insights } = telemetry;
  const voltageSeries = makeRangeSeries(series.power, metrics.voltage / Math.max(metrics.power, 1), 1);
  const currentSeries = makeRangeSeries(series.power, metrics.current / Math.max(metrics.power, 1), 2);
  const frequencySeries = series.power.map((point, index) => ({
    label: point.label,
    value: Number((metrics.frequency + Math.sin(index / 3) * 0.05).toFixed(2)),
  }));

  const pages = [
    page("tensao", "Tensão", Zap, formatNumber(metrics.voltage), "V", "Qualidade da rede elétrica", "Detalha a leitura de tensão recebida do PZEM-004T e mostra se a rede está dentro da faixa operacional.", { title: "Variação de tensão", subtitle: "Amostras recentes", series: voltageSeries, metric: "Volts" }, [["Faixa ideal", "208 - 230 V"], ["Status", metrics.voltage > 230 || metrics.voltage < 208 ? "Atenção" : "Normal"], ["Fonte", "Rede AC"], ["Última leitura", system.lastReading]], [["Mínimo estimado", `${formatNumber(Math.min(...voltageSeries.map((item) => item.value)))} V`], ["Máximo estimado", `${formatNumber(Math.max(...voltageSeries.map((item) => item.value)))} V`], ["Desvio atual", `${formatNumber(Math.abs(metrics.voltage - 220))} V`]]),
    page("corrente", "Corrente", Activity, formatNumber(metrics.current), "A", "Carga ativa no circuito", "Mostra a corrente solicitada pelas cargas conectadas e ajuda a detectar aumento de demanda.", { title: "Corrente em tempo real", subtitle: "Carga por minuto", series: currentSeries, metric: "Amperes" }, [["Carga instantânea", metrics.current > 9 ? "Alta" : "Moderada"], ["Média recente", `${formatNumber(metrics.current * 0.94)} A`], ["Sensor", "PZEM-004T"], ["Latência MQTT", `${device.mqttLatency} ms`]], [["Corrente por kW", `${formatNumber(metrics.current / Math.max(metrics.power / 1000, 1))} A/kW`], ["Temperatura do módulo", `${formatNumber(device.temperature)} C`]]),
    page("potencia", "Potência", PlugZap, formatNumber(metrics.power, { maximumFractionDigits: 0 }), "W", "Demanda instantânea", "Concentra a leitura de potência atual e evidencia picos operacionais em tempo real.", { title: "Potência em tempo real", subtitle: "Amostragem MQTT", series: series.power, metric: "Watts" }, [["Limite de alerta", "1800 W"], ["Status", metrics.power > 1800 ? "Crítico" : "Controlado"], ["Potência aparente", `${formatNumber(metrics.voltage * metrics.current, { maximumFractionDigits: 0 })} VA`], ["Fator estimado", formatNumber(metrics.power / Math.max(metrics.voltage * metrics.current, 1))]], [["Custo instantâneo", `${formatCurrency(metrics.power * 0.00082)}/h`], ["Última leitura", system.lastReading]]),
    page("frequencia", "Frequência", Waves, formatNumber(metrics.frequency, { minimumFractionDigits: 2 }), "Hz", "Estabilidade AC", "Monitora a frequência da rede para indicar estabilidade do fornecimento elétrico.", { title: "Oscilação de frequência", subtitle: "Estabilidade da rede", series: frequencySeries, metric: "Hz" }, [["Referência", "60.00 Hz"], ["Desvio", `${formatNumber(Math.abs(metrics.frequency - 60), { minimumFractionDigits: 2 })} Hz`], ["Condição", Math.abs(metrics.frequency - 60) > 0.2 ? "Observar" : "Estável"], ["Fonte", "Rede AC"]], [["Jitter estimado", "0.05 Hz"]]),
    page("energia-total", "Energia total", BatteryCharging, formatNumber(metrics.totalEnergy), "kWh", "Acumulado geral", "Mostra o total acumulado desde o início do monitoramento.", { title: "Histórico de consumo", subtitle: "InfluxDB time-series", series: series.consumption, metric: "kWh", type: "bar", tone: "energy" }, [["Total acumulado", `${formatNumber(metrics.totalEnergy)} kWh`], ["Origem", "InfluxDB"], ["Ciclo", "Contínuo"], ["Última leitura", system.lastReading]], [["Consumo diário", `${formatNumber(metrics.dailyEnergy)} kWh`], ["Consumo mensal", `${formatNumber(metrics.monthlyEnergy)} kWh`]]),
    page("consumo-diario", "Consumo diário", TimerReset, formatNumber(metrics.dailyEnergy), "kWh", "Ciclo atual", "Resume o consumo acumulado no dia e suas janelas de maior demanda.", { title: "Perfil diário", subtitle: "Consumo por janela", series: series.daily, metric: "kWh" }, [["Hoje", `${formatNumber(metrics.dailyEnergy)} kWh`], ["Média de 7 dias", "13,4 kWh"], ["Projeção do dia", `${formatNumber(metrics.dailyEnergy * 1.08)} kWh`], ["Janela crítica", "18:00 - 21:00"]], [["Carga fantasma", "1,8 kWh/dia"], ["Economia possível", "12%"]]),
    page("consumo-mensal", "Consumo mensal", BatteryCharging, formatNumber(metrics.monthlyEnergy), "kWh", "Acumulado do mês", "Compara o uso mensal com o histórico de referência.", { title: "Comparação mensal", subtitle: "Baseline vs uso atual", series: series.comparison, metric: "kWh", type: "bar", tone: "compare" }, [["Mês atual", `${formatNumber(metrics.monthlyEnergy)} kWh`], ["Baseline", "350 kWh"], ["Tendência", metrics.monthlyEnergy > 350 ? "Acima" : "Abaixo"], ["Dias restantes", "8"]], [["Previsão final", `${formatNumber(metrics.monthlyEnergy * 1.12)} kWh`], ["Fonte histórica", "InfluxDB"]]),
    page("custo-estimado", "Custo estimado", BadgeDollarSign, formatCurrency(metrics.monthlyCost), "", "Tarifa configurada", "Converte consumo em custo projetado antes do fechamento da fatura.", { title: "Comparação mensal", subtitle: "Consumo usado no custo", series: series.comparison, metric: "kWh", type: "bar", tone: "energy" }, [["Custo atual", formatCurrency(metrics.monthlyCost)], ["Previsão mensal", "R$ 312,80"], ["Tarifa média", "R$ 0,88/kWh"], ["Margem do limite", "8,9%"]], [["Maior impacto", "Climatização"], ["Economia prevista", "R$ 27,40"]]),
    page("eficiencia", "Eficiência", CircleGauge, metrics.efficiency, "%", "Perfil energético", "Combina consumo, estabilidade e perdas prováveis em um índice operacional.", { title: "Base da eficiência", subtitle: "Consumo por janela", series: series.daily, metric: "kWh" }, [["Índice atual", `${metrics.efficiency}%`], ["Meta", "92%"], ["Perda provável", `${100 - metrics.efficiency}%`], ["Classificação", metrics.efficiency >= 92 ? "Ótima" : "Ajustar"]], [["Ações sugeridas", "3"], ["Confiança", "Alta"]]),
    page("wifi-rssi", "Wi-Fi RSSI", Signal, device.wifi, "dBm", "Sinal do ESP32", "Indica a força do sinal Wi-Fi usado para enviar telemetria.", { title: "Potência recebida via IoT", subtitle: "Payloads MQTT", series: series.power, metric: "Watts" }, [["Sinal atual", `${device.wifi} dBm`], ["Status MQTT", statusLabel[system.mqtt] ?? system.mqtt], ["IP", device.ip], ["Firmware", device.firmware]], [["Faixa recomendada", "-30 a -67 dBm"], ["Última leitura", system.lastReading]]),
    page("ip-esp32", "IP do ESP32", Router, device.ip, "", "Endereço de rede", "Mostra o endereço atual usado pelo ESP32 na rede local.", { title: "Telemetria associada", subtitle: "Amostras recentes", series: series.power, metric: "Watts" }, [["IP atual", device.ip], ["Dispositivo", device.name], ["MQTT", statusLabel[system.mqtt] ?? system.mqtt], ["ESP32", statusLabel[system.esp32] ?? system.esp32]], [["Tópico MQTT", "energyos/esp32/pzem004t/telemetry"]]),
    page("latencia-mqtt", "Latência MQTT", Workflow, device.mqttLatency, "ms", "Tempo de transmissão", "Mede o intervalo estimado entre leitura, publicação e chegada ao back-end.", { title: "Potência no contexto da latência", subtitle: "Amostragem MQTT", series: series.power, metric: "Watts" }, [["Latência atual", `${device.mqttLatency} ms`], ["Taxa de leitura", device.refreshRate], ["Broker", statusLabel[system.mqtt] ?? system.mqtt], ["Última leitura", system.lastReading]], [["Faixa esperada", "18 - 80 ms"]]),
    page("uptime-hardware", "Uptime hardware", Timer, device.hardwareUptime, "", "Tempo ativo do módulo", "Mostra há quanto tempo o ESP32 está operando sem reinicialização.", { title: "Telemetria durante uptime", subtitle: "Amostras recentes", series: series.power, metric: "Watts" }, [["Uptime hardware", device.hardwareUptime], ["Uptime do sistema", system.uptime], ["ESP32", statusLabel[system.esp32] ?? system.esp32], ["Firmware", device.firmware]], [["Última leitura", system.lastReading]]),
    page("taxa-leitura", "Taxa de leitura", Cpu, device.refreshRate, "", "Intervalo de coleta", "Define a frequência com que o ESP32 coleta e publica dados.", { title: "Amostras por leitura", subtitle: "MQTT", series: series.power, metric: "Watts" }, [["Taxa atual", device.refreshRate], ["Sensor", "PZEM-004T"], ["Latência MQTT", `${device.mqttLatency} ms`], ["Última leitura", system.lastReading]], [["Uso", "Atualização em tempo real"]]),
    page("temperatura", "Temperatura", Thermometer, formatNumber(device.temperature), "C", "Condição do módulo", "Acompanha a temperatura estimada do módulo para apoiar diagnóstico de hardware.", { title: "Potência e temperatura", subtitle: "Correlação operacional", series: series.power, metric: "Watts" }, [["Temperatura atual", `${formatNumber(device.temperature)} C`], ["Faixa observada", "32 - 45 C"], ["Status", device.temperature > 45 ? "Atenção" : "Normal"], ["Dispositivo", device.name]], [["Última leitura", system.lastReading]]),
    page("firmware", "Firmware", Cpu, device.firmware, "", "Versão embarcada", "Identifica a versão do firmware rodando no ESP32.", { title: "Telemetria do firmware", subtitle: "Payloads MQTT", series: series.power, metric: "Watts" }, [["Firmware", device.firmware], ["Dispositivo", device.name], ["Taxa de leitura", device.refreshRate], ["Uptime hardware", device.hardwareUptime]], [["Última leitura", system.lastReading]]),
    page("sistema", "Sistema", Gauge, statusLabel[system.status] ?? system.status, "", "Estado geral", "Resume a condição operacional do sistema EnergyOS.", { title: "Base operacional", subtitle: "Telemetria recente", series: series.power, metric: "Watts" }, [["Sistema", statusLabel[system.status] ?? system.status], ["MQTT", statusLabel[system.mqtt] ?? system.mqtt], ["ESP32", statusLabel[system.esp32] ?? system.esp32], ["Uptime", system.uptime]], [["Última leitura", system.lastReading]]),
    page("esp32", "ESP32", Cpu, statusLabel[system.esp32] ?? system.esp32, "", "Status do dispositivo", "Mostra o estado operacional do microcontrolador conectado ao medidor.", { title: "Telemetria ESP32", subtitle: "Amostras recentes", series: series.power, metric: "Watts" }, [["ESP32", statusLabel[system.esp32] ?? system.esp32], ["IP", device.ip], ["Firmware", device.firmware], ["Wi-Fi RSSI", `${device.wifi} dBm`]], [["Uptime hardware", device.hardwareUptime]]),
    page("uptime", "Uptime", Clock, system.uptime, "", "Tempo de operação", "Indica há quanto tempo o sistema permanece ativo.", { title: "Telemetria no uptime", subtitle: "Amostras recentes", series: series.power, metric: "Watts" }, [["Uptime do sistema", system.uptime], ["Uptime hardware", device.hardwareUptime], ["Sistema", statusLabel[system.status] ?? system.status], ["Última leitura", system.lastReading]], []),
    page("mqtt", "MQTT", Radio, statusLabel[system.mqtt] ?? system.mqtt, "", "Conexão do broker", "Detalha o estado do canal MQTT usado para transportar os payloads do ESP32.", { title: "Payloads MQTT", subtitle: "Amostragem de potência", series: series.power, metric: "Watts" }, [["MQTT", statusLabel[system.mqtt] ?? system.mqtt], ["Latência", `${device.mqttLatency} ms`], ["Taxa de leitura", device.refreshRate], ["Tópico", "energyos/esp32/pzem004t/telemetry"]], []),
    page("rede-ac", "Rede AC", Factory, `${formatNumber(metrics.voltage)} V`, "", "Fonte elétrica", "Representa a entrada da rede elétrica antes da medição.", { title: "Tensão da rede", subtitle: "Amostras recentes", series: voltageSeries, metric: "Volts" }, [["Tensão", `${formatNumber(metrics.voltage)} V`], ["Frequência", `${formatNumber(metrics.frequency, { minimumFractionDigits: 2 })} Hz`], ["Status", metrics.voltage > 230 || metrics.voltage < 208 ? "Atenção" : "Normal"], ["Fonte", "Rede AC"]], []),
    page("medidor-pzem", "Medidor PZEM-004T", Gauge, "PZEM-004T", "", "Sensor de energia", "Centraliza tensão, corrente, potência e energia enviadas pelo medidor.", { title: "Medição do PZEM", subtitle: "Amostras recentes", series: series.power, metric: "Watts" }, [["Potência", `${formatNumber(metrics.power, { maximumFractionDigits: 0 })} W`], ["Tensão", `${formatNumber(metrics.voltage)} V`], ["Corrente", `${formatNumber(metrics.current)} A`], ["Energia total", `${formatNumber(metrics.totalEnergy)} kWh`]], []),
    page("cargas", "Cargas", Factory, `${formatNumber(metrics.current)} A`, "", "Consumo conectado", "Representa os equipamentos conectados que demandam energia da rede.", { title: "Demanda das cargas", subtitle: "Amostras recentes", series: series.power, metric: "Watts" }, [["Corrente", `${formatNumber(metrics.current)} A`], ["Potência", `${formatNumber(metrics.power, { maximumFractionDigits: 0 })} W`], ["Carga instantânea", metrics.current > 9 ? "Alta" : "Moderada"], ["Janela crítica", "18:00 - 21:00"]], []),
    page("atualizacao", "Atualização", TimerReset, device.refreshRate, "", "Ritmo de leitura", "Mostra o intervalo de atualização usado no painel em tempo real.", { title: "Amostras atualizadas", subtitle: "Tempo real", series: series.power, metric: "Watts" }, [["Atualização", device.refreshRate], ["Última leitura", system.lastReading], ["Latência MQTT", `${device.mqttLatency} ms`], ["Status MQTT", statusLabel[system.mqtt] ?? system.mqtt]], []),
  ];

  alerts.forEach((alert) => {
    pages.push(
      page(`alerta-${alert.id}`, alert.title, AlertTriangle, alert.priority, "", "Evento operacional", alert.description, { title: "Potência no contexto do alerta", subtitle: "Correlação operacional", series: series.power, metric: "Watts" }, [["Prioridade", alert.priority], ["Status", statusLabel[alert.status] ?? alert.status], ["Horário", alert.time], ["Fonte", "Central de alertas"]], [["Descrição", alert.description]]),
    );
  });

  const insightIds = ["previsao-mensal", "maior-consumo", "media-diaria", "desperdicio-provavel"];
  insights.forEach((insight, index) => {
    pages.push(
      page(insightIds[index] ?? `insight-${index + 1}`, insight.label, BrainCircuit, insight.value, "", "Insight de consumo", insight.detail, { title: "Base do insight", subtitle: "Consumo por janela", series: series.daily, metric: "kWh" }, [["Valor", insight.value], ["Tendência", insight.trend], ["Fonte", "Análise inteligente"], ["Confiança", "Alta"]], [["Detalhe", insight.detail]]),
    );
  });

  return pages;
}

export default function DataDetailPage({ dataId }) {
  const { telemetry, adapters } = useEnergyTelemetry();
  const pages = buildDataPages(telemetry);
  const current = pages.find((item) => item.id === dataId) ?? pages[0];
  const Icon = current.icon;

  return (
    <DashboardLayout telemetry={telemetry} adapters={adapters}>
      <main className="dashboard metric-detail-page" id="top">
        <nav className="metric-nav" aria-label="Páginas de dados">
          <a href="#/">Dashboard</a>
          {navItems.map(([label, id]) => (
            <a key={id} className={id === current.id ? "active" : ""} href={`#/dados/${id}`}>
              {label}
            </a>
          ))}
        </nav>

        <section className="metric-detail-hero">
          <div className="metric-detail-copy">
            <span className="metric-icon large">
              <Icon size={26} aria-hidden="true" />
            </span>
            <p className="eyebrow">{current.subtitle}</p>
            <h1>{current.title}</h1>
            <p>{current.summary}</p>
          </div>
          <div className="metric-detail-reading section-primary-reading">
            <span>Valor atual</span>
            <strong>{current.value}</strong>
            <small>{current.unit}</small>
          </div>
        </section>

        <section className="detail-stat-grid" aria-label="Resumo do dado">
          {current.stats.map(([label, value]) => (
            <article className="detail-stat-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="metric-detail-grid">
          <EnergyChart {...current.chart} href={`#/dados/${current.id}`} />
          <article className="metric-breakdown-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Contexto do dado</p>
                <h2>Leituras relacionadas</h2>
              </div>
              <Gauge size={20} aria-hidden="true" />
            </div>
            <div className="breakdown-list">
              {current.rows.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </DashboardLayout>
  );
}
