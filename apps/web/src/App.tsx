import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { ActivityPage } from "./pages/ActivityPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { PoliciesPage } from "./pages/PoliciesPage";
import { SettingsPage } from "./pages/SettingsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/inbox" element={<Navigate replace to="/dashboard" />} />
      <Route path="/analytics" element={<Navigate replace to="/settings" />} />
      <Route path="/activity" element={<Navigate replace to="/audit" />} />
      <Route path="/audit" element={<ActivityPage />} />
      <Route path="/policies" element={<PoliciesPage />} />
      <Route path="/extension" element={<Navigate replace to="/settings" />} />
      <Route path="/integrations" element={<Navigate replace to="/settings" />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/profile" element={<Navigate replace to="/settings" />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
