import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
);

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 780,
    easing: "easeOutQuart",
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(8, 12, 18, 0.94)",
      borderColor: "rgba(250, 204, 21, 0.24)",
      borderWidth: 1,
      titleColor: "#f8fafc",
      bodyColor: "#cbd5e1",
      padding: 12,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(148, 163, 184, 0.08)",
      },
      ticks: {
        color: "rgba(203, 213, 225, 0.58)",
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 7,
      },
    },
    y: {
      grid: {
        color: "rgba(148, 163, 184, 0.1)",
      },
      ticks: {
        color: "rgba(203, 213, 225, 0.58)",
      },
      border: {
        display: false,
      },
    },
  },
};
