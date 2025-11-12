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
    <div style="padding: 30px; font-family: sans-serif; max-width: 700px; margin: 50px auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h1 style="color: #e74c3c; margin-top: 0;">⚠️ Erreur de chargement</h1>
      <p>Une erreur s'est produite lors du chargement de l'application.</p>
      <details style="margin-top: 20px;">
        <summary style="cursor: pointer; font-weight: bold; margin-bottom: 10px;">Détails de l'erreur</summary>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px;">${error instanceof Error ? error.message + "\n\n" + error.stack : String(error)}</pre>
      </details>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
        🔄 Recharger la page
      </button>
    </div>
  `;
}
