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
import RefundReport from "./pages/dashboard/flight/RefundReport";
import ReissueReport from "./pages/dashboard/flight/ReissueReport";
import HoldPNRReport from "./pages/dashboard/flight/HoldPNRReport";
import TravelCalendar from "./pages/dashboard/flight/TravelCalendar";
import TicketStatusReport from "./pages/dashboard/flight/TicketStatusReport";
import PNRImport from "./pages/dashboard/flight/PNRImport";
import OfflineRequest from "./pages/dashboard/flight/OfflineRequest";
import AgentRegistration from "./pages/AgentRegistration";
import AgencySettings from "./pages/dashboard/settings/AgencySettings";
import TicketCopyPage from "./pages/FlightBooking/TicketCopyPage";
import WalletOverview from "./pages/dashboard/wallet/WalletOverview";
import AddFundsPage from "./pages/dashboard/wallet/AddFundsPage";
import WalletHistory from "./pages/dashboard/wallet/WalletHistory";
import WalletStatement from "./pages/dashboard/wallet/WalletStatement";
import RefundsAdjustments from "./pages/dashboard/wallet/RefundsAdjustments";

function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC LOGIN */}
      <Route element={<MainLayout variant="public" />}>
        <Route path="/login" element={<LoginLanding />} />
        <Route path="/agent-register" element={<AgentRegistration />} />
      </Route>

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
        <Route path="dashboard/flight/my-bookings" element={<FlightReport />} />


        <Route path="/agency-settings" element={<AgencySettings />} />

        <Route path="dashboard/flight/refund-report" element={<RefundReport />} />
        <Route path="dashboard/flight/reissue-report" element={<ReissueReport />} />
        <Route path="dashboard/flight/holdpnr-report" element={<HoldPNRReport />} />
        <Route path="dashboard/flight/travel-calendar" element={<TravelCalendar />} />
        <Route path="dashboard/flight/ticket-status-report" element={<TicketStatusReport />} />
        <Route path="dashboard/flight/pnr-import" element={<PNRImport />} />
        <Route path="dashboard/flight/offline-request" element={<OfflineRequest />} />

        <Route path="/pages/FlightBooking/ticket-copy" element={<TicketCopyPage />} />

        <Route path="/admin/wallet" element={<WalletOverview />} />
        <Route path="/admin/wallet/add-funds" element={<AddFundsPage />} />
        <Route path="/admin/wallet/history" element={<WalletHistory />} />
        <Route path="/admin/wallet/statement" element={<WalletStatement />} />
        <Route path="/admin/wallet/refunds" element={<RefundsAdjustments />} />

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
