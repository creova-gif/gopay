import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initCapacitor } from "./utils/capacitor";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

initCapacitor().catch(console.warn);
