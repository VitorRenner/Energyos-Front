import { useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage.jsx";
import DataDetailPage from "./pages/DataDetailPage.jsx";
import MetricDetailPage from "./pages/MetricDetailPage.jsx";
import SectionDetailPage from "./pages/SectionDetailPage.jsx";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";

function getRoute() {
  const route = window.location.hash.replace(/^#\/?/, "");
  return route || "dashboard";
}

function StartupScreen({ phase }) {
  return (
    <div className={`startup-screen ${phase}`} role="status" aria-live="polite">
      <div className="startup-orbit">
        <span>OK</span>
      </div>
      <div className="startup-logo" aria-hidden={phase !== "logo"}>
        <span className="brand-mark">E</span>
        <strong>EnergyOS</strong>
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [startupPhase, setStartupPhase] = useState("spin");
  const [showStartup, setShowStartup] = useState(true);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const logoTimer = window.setTimeout(() => setStartupPhase("logo"), 3400);
    const doneTimer = window.setTimeout(() => setShowStartup(false), 4700);

    return () => {
      window.clearTimeout(logoTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  const detailMatch = route.match(/^metricas\/(.+)$/);
  const sectionMatch = route.match(/^sessoes\/(.+)$/);
  const dataMatch = route.match(/^dados\/(.+)$/);

  return (
    <AppErrorBoundary>
      {showStartup && <StartupScreen phase={startupPhase} />}
      {detailMatch ? (
        <MetricDetailPage metricId={detailMatch[1]} />
      ) : sectionMatch ? (
        <SectionDetailPage sectionId={sectionMatch[1]} />
      ) : dataMatch ? (
        <DataDetailPage dataId={dataMatch[1]} />
      ) : (
        <DashboardPage />
      )}
    </AppErrorBoundary>
  );
}
