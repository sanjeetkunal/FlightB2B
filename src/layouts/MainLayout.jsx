import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      {/* <main className="flex-1">{children}</main> */}
       <main className="max-w-[90rem] mx-auto px-4 py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
