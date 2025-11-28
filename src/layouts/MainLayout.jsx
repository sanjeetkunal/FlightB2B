import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatWidget from "../components/chat/ChatWidget";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-dvh bg-gray-100">
      <Header />
      {/* <main className="flex-1">{children}</main> */}
      <main className="flex-1">
      
          <Outlet />
      <ChatWidget />
      </main>
      <Footer />
    </div>
  );
}
