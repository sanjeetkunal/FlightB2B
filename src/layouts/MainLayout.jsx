// MainLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatWidget from "../components/chat/ChatWidget";

export default function MainLayout({ variant = "private" }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--surface2)] text-[var(--text)]">
      <Header variant={variant} />

      <main className="flex-1">
        <Outlet />
        <ChatWidget />
      </main>

      <Footer />
    </div>
  );
}
