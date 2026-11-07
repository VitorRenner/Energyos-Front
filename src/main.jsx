import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style.css";

function BootError({ message }) {
  return (
    <div className="boot-fallback">
      <article>
        <strong>EnergyOS nao conseguiu iniciar.</strong>
        <p>O servidor Vite abriu, mas o React encontrou um erro durante a renderizacao.</p>
        <code>{message}</code>
      </article>
    </div>
  );
}

try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <BootError message={error?.message ?? "Erro desconhecido"} />,
  );
}
