import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("Error rendering app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Erreur de chargement</h1>
      <p>Une erreur s'est produite lors du chargement de l'application.</p>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
