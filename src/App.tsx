import { BrowserRouter, Routes, Route } from "react-router";
import Header from "./components/suraksha/Header";
import Footer from "./components/suraksha/Footer";
import Home from "./pages/suraksha/Home";
import AlertsPage from "./pages/suraksha/AlertsPage";
import SafeZones from "./pages/suraksha/SafeZones";
import GuidesPage from "./pages/suraksha/GuidesPage";
import HelplinesPage from "./pages/suraksha/HelplinesPage";
import AdminLogin from "./pages/suraksha/AdminLogin";
import AdminDashboard from "./pages/suraksha/AdminDashboard";
import ManageAlerts from "./admin/suraksha/ManageAlerts";
import ManageZones from "./admin/suraksha/ManageZones";
import ManageGuides from "./admin/suraksha/ManageGuides";
import ManageHelplines from "./admin/suraksha/ManageHelplines";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/safe-zones" element={<SafeZones />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/helplines" element={<HelplinesPage />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/alerts" element={<ManageAlerts />} />
            <Route path="/admin/zones" element={<ManageZones />} />
            <Route path="/admin/guides" element={<ManageGuides />} />
            <Route path="/admin/helplines" element={<ManageHelplines />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
