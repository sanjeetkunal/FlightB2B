import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-dvh bg-gray-100">
      <Header />
      {/* <main className="flex-1">{children}</main> */}
       <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
