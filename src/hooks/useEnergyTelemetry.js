import { useEffect, useMemo, useState } from "react";
import { evolveTelemetry, initialTelemetry } from "../services/mockEnergyService.js";


export function useEnergyTelemetry() {
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [isLoading, setIsLoading] = useState(true);

  const adaptersRef = useMemo(
    () => ({
      rest: "/api/telemetry/latest",
      websocket: "ws://localhost:3001/energyos/live",
      mqttTopic: "energyos/esp32/pzem004t/telemetry",
      storage: "InfluxDB bucket energyos_metrics",
    }),
    [],
  );

  const adapters = adaptersRef;

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => setIsLoading(false), 700);

    let stopped = false;

    const poll = async () => {
      try {
        const res = await fetch(adapters.rest, {

          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!stopped && json) setTelemetry(json);
      } catch (e) {
        // fallback: mantém o comportamento anterior (mock)
      }
    };

    // Primeira tentativa rápida
    poll();

    // Atualiza em intervalo (boa performance para UI)
    const interval = window.setInterval(() => {
      // tenta buscar; se falhar, evolui mock
      poll().catch(() => {
        setTelemetry((current) => evolveTelemetry(current));
      });
    }, 1800);

    return () => {
      stopped = true;
      window.clearTimeout(loadingTimer);
      window.clearInterval(interval);
    };
  }, []);

  return { telemetry, isLoading, adapters };
}

