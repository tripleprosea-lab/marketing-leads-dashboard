import { Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar.js";
import { LeadsDashboard } from "./pages/LeadsDashboard.js";
import { MarketingDashboard } from "./pages/MarketingDashboard.js";
import { Automations } from "./pages/Automations.js";
import { Settings } from "./pages/Settings.js";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<LeadsDashboard />} />
          <Route path="/marketing" element={<MarketingDashboard />} />
          <Route path="/automatiseringen" element={<Automations />} />
          <Route path="/instellingen" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}
