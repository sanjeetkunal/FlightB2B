import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthed } from "./auth";

import MainLayout from "./layouts/MainLayout";
import LoginLanding from "./pages/LoginLanding";
import Home from "./pages/Home";
import FlightResults from "./pages/FlightResults"; // agar yeh .tsx hai to import path adjust kar lo

function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public (no header) */}
      <Route path="/login" element={<LoginLanding />} />

      {/* After-login area (Header inside MainLayout) */}
      <Route
        path="/"
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        {/* index == "/"  => Home */}
        <Route index element={<Home />} />
       <Route path="/flight-results" element={<FlightResults />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={isAuthed() ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
