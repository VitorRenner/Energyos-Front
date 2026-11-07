const now = new Date();

const makeSeries = (length, base, volatility, unit = "") =>
  Array.from({ length }, (_, index) => {
    const curve = Math.sin(index / 2.2) * volatility;
    const pulse = Math.cos(index / 4.4) * (volatility * 0.55);
    const value = Math.max(0, base + curve + pulse + (index % 5) * 2.8);

    return {
      label: new Date(now.getTime() - (length - index) * 60_000).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: Number(value.toFixed(1)),
      unit,
    };
  });

export const initialTelemetry = {
  system: {
    status: "operational",
    mqtt: "online",
    esp32: "online",
    uptime: "18d 07h 42m",
    lastReading: new Date().toLocaleTimeString("pt-BR"),
  },
  metrics: {
    power: 1368,
    voltage: 221.7,
    current: 6.18,
    frequency: 59.98,
    totalEnergy: 482.4,
    dailyEnergy: 14.8,
    monthlyEnergy: 326.5,
    monthlyCost: 287.32,
    efficiency: 94,
  },
  device: {
    name: "ESP32-WROOM + PZEM-004T",
    wifi: -47,
    ip: "192.168.15.42",
    mqttLatency: 38,
    hardwareUptime: "432h 18m",
    refreshRate: "1.0s",
    temperature: 38.6,
    firmware: "energyos-fw 1.4.2",
  },
  series: {
    power: makeSeries(28, 1260, 210, "W"),
    consumption: makeSeries(18, 9.4, 2.3, "kWh"),
    comparison: makeSeries(12, 270, 42, "kWh"),
    daily: makeSeries(24, 0.62, 0.2, "kWh"),
  },
  alerts: [
    {
      id: 1,
      title: "Pico de consumo detectado",
      description: "Potência acima da média operacional nos últimos 3 minutos.",
      priority: "alta",
      status: "active",
      time: "13:02:14",
    },
    {
      id: 2,
      title: "MQTT estável",
      description: "Broker recebeu 1.742 mensagens sem perda no ciclo atual.",
      priority: "info",
      status: "resolved",
      time: "12:58:03",
    },
    {
      id: 3,
      title: "Tensão sob observação",
      description: "Variação de rede próxima ao limite configurado.",
      priority: "media",
      status: "active",
      time: "12:51:44",
    },
  ],
  insights: [
    {
      label: "Previsão mensal",
      value: "R$ 312,80",
      detail: "8,9% abaixo do limite configurado",
      trend: "down",
    },
    {
      label: "Maior consumo",
      value: "18:00 - 21:00",
      detail: "Pico ligado à climatização e à cozinha",
      trend: "up",
    },
    {
      label: "Média diária",
      value: "13,4 kWh",
      detail: "Baseada nos últimos 7 dias",
      trend: "stable",
    },
    {
      label: "Desperdício provável",
      value: "1,8 kWh/dia",
      detail: "Carga fantasma detectada na madrugada",
      trend: "up",
    },
  ],
};

export function evolveTelemetry(previous) {
  const drift = (scale) => (Math.random() - 0.5) * scale;
  const power = Math.max(420, previous.metrics.power + drift(160));
  const voltage = Math.min(235, Math.max(205, previous.metrics.voltage + drift(1.6)));
  const current = Math.max(0.8, power / voltage);
  const timestamp = new Date().toLocaleTimeString("pt-BR");

  const nextPoint = {
    label: timestamp.slice(0, 5),
    value: Number(power.toFixed(1)),
    unit: "W",
  };

  return {
    ...previous,
    system: {
      ...previous.system,
      lastReading: timestamp,
      mqtt: Math.random() > 0.04 ? "online" : "degraded",
      esp32: Math.random() > 0.025 ? "online" : "syncing",
    },
    metrics: {
      ...previous.metrics,
      power: Number(power.toFixed(0)),
      voltage: Number(voltage.toFixed(1)),
      current: Number(current.toFixed(2)),
      frequency: Number((59.98 + drift(0.08)).toFixed(2)),
      dailyEnergy: Number((previous.metrics.dailyEnergy + power / 3_600_000).toFixed(2)),
      monthlyEnergy: Number((previous.metrics.monthlyEnergy + power / 3_600_000).toFixed(2)),
      monthlyCost: Number((previous.metrics.monthlyCost + power * 0.00000082).toFixed(2)),
      efficiency: Math.min(99, Math.max(82, Math.round(previous.metrics.efficiency + drift(2)))),
    },
    device: {
      ...previous.device,
      wifi: Math.round(Math.min(-35, Math.max(-72, previous.device.wifi + drift(3)))),
      mqttLatency: Math.round(Math.max(18, previous.device.mqttLatency + drift(12))),
      temperature: Number(Math.max(32, previous.device.temperature + drift(0.8)).toFixed(1)),
    },
    series: {
      ...previous.series,
      power: [...previous.series.power.slice(1), nextPoint],
      daily: [
        ...previous.series.daily.slice(1),
        { label: timestamp.slice(0, 5), value: Number((power / 1000).toFixed(2)), unit: "kWh" },
      ],
    },
  };
}
