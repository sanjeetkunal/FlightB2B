import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthed } from "./auth";

import MainLayout from "./layouts/MainLayout";
import LoginLanding from "./pages/LoginLanding";
import Home from "./pages/Home";
import FlightResults from "./pages/FlightResults";

import OnewayResults from "./pages/OnewayResults";
import RoundtripResults from "./pages/RoundtripResults";
import IntlRoundTripResultsPage from "./pages/IntlRTResults";
import PassengerDetailsPage from "./pages/PassengerDetailsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";

function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC LOGIN */}
      <Route path="/login" element={<LoginLanding />} />

      {/* PROTECTED AREA WITH MAIN LAYOUT (Header + Footer inside MainLayout) */}
      <Route
        path="/"
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        {/* / */}
        <Route index element={<Home />} />

        {/* /flight-results */}
        <Route path="flight-results" element={<FlightResults />} />

        {/* /flight-results/oneway */}
        <Route path="flight-results/oneway" element={<OnewayResults />} />

        {/* /flight-results/roundtrip */}
        <Route path="flight-results/roundtrip" element={<RoundtripResults />} />

        {/* /flight-results/intl-rt-results */}
        <Route
          path="flight-results/intl-rt-results"
          element={<IntlRoundTripResultsPage />}
        />

        {/* /flights/passenger-details */}
        <Route
          path="flights/passenger-details"
          element={<PassengerDetailsPage />}
        />

        {/* ✅ /dashboard — ab MainLayout ke andar, isliye Header/Footer dikhenge */}
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>

      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to={isAuthed() ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
