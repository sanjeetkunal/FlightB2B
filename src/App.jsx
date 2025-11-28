import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthed } from "./auth";
import MainLayout from "./layouts/MainLayout";
import LoginLanding from "./pages/LoginLanding";
import Home from "./pages/FlightBooking/Home";
import FlightResults from "./pages/FlightBooking/FlightResults";
import PassengerDetailsPage from "./pages/FlightBooking/PassengerDetailsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import PaymentConfirmationPage from "./pages/FlightBooking/PaymentConfirmationPage";
import FlightReport from "./pages/dashboard/flight/FlightReport";

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

        <Route index element={<Home />} />

        <Route path="flight-results" element={<FlightResults />} />

        <Route path="flights/passenger-details" element={<PassengerDetailsPage />} />

        <Route path="/flights/review-and-pay" element={<PaymentConfirmationPage />} />

        <Route path="dashboard" element={<DashboardPage />} />
           <Route
          path="dashboard/flight/my-bookings"
          element={<FlightReport />}
        />

        {/* (optional) same report for ticket-report link bhi */}
        <Route
          path="dashboard/flight/ticket-report"
          element={<FlightReport />}
        />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to={isAuthed() ? "/" : "/login"} replace />} />
    </Routes>
  );
}
