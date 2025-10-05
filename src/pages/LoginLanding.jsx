import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../auth";

// ⬇️ Header include (adjust path if needed)
// If your Header is at src/components/Header.jsx then:
// import Header from "../components/Header";
import Header from "../components/Header";

export default function LoginLanding() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!email.includes("@") || !email.includes(".")) {
      setErr("Enter a valid business email.");
      return;
    }
    if (!password) {
      setErr("Enter password.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate API

    // DEMO credentials
    const ok =
      (email === "agent@v2a.com" && password === "Password123") ||
      (email === "distributor@tyb.com" && password === "Password123");

    if (!ok) {
      setErr("Invalid credentials. Use agent@v2a.com / Password123");
      setLoading(false);
      return;
    }

    // save auth + redirect to Home ("/")
    saveAuth({ user: { email }, token: "demo-token" });
    navigate("/", { replace: true }); // Home
    setLoading(false);
  };

  return (
    <>
      {/* Header on login page (public variant hides wallet/profile) */}
      <Header variant="public" />

      <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur border shadow-md rounded-3xl max-w-5xl w-full grid lg:grid-cols-2 gap-8 p-6 sm:p-10">
          {/* Left: pitch */}
          <div>
            <h1 className="text-4xl font-semibold">
              Let’s <span className="text-slate-900">Travel</span> The{" "}
              <span className="text-amber-500 font-bold">World</span> with us
            </h1>
            <p className="mt-2 text-slate-600">
              One platform for Flights, Hotels, Bus, Train, Visa & Utilities — built for travel agents.
            </p>
            <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3 text-xs">
              {["Flights","Hotels","Bus","Train","Visa","Utilities"].map(s=>(
                <div key={s} className="border rounded-xl bg-blue-50 text-blue-600 px-3 py-2 text-center">{s}</div>
              ))}
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {[
                "GDS + LCC in one dashboard",
                "Markups, commissions & GST invoicing",
                "Book & Hold + partial payments",
                "24×7 partner support"
              ].map((t,i)=>(
                <li key={i} className="flex items-center gap-2"><span>✅</span>{t}</li>
              ))}
            </ul>
          </div>

          {/* Right: login card */}
          <div className="bg-white/80 backdrop-blur border rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-center text-amber-600">Agent Login</h2>
            <p className="text-center text-sm text-slate-500 mb-4">Access your B2B dashboard</p>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Business Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  placeholder="agent@v2a.com"
                  className="mt-1 w-full rounded-xl border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 px-3 py-2.5 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <div className="relative mt-1">
                  <input
                    type={show ? "text":"password"}
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    placeholder="Password123"
                    className="w-full rounded-xl border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 px-3 py-2.5 pr-10 outline-none"
                    required
                  />
                  <button type="button" onClick={()=>setShow(s=>!s)} className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700">
                    {show ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {err && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-2.5">{err}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 font-medium disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>

              <p className="text-xs text-slate-500 text-center">
                Demo: <span className="font-medium">agent@v2a.com / Password123</span>
              </p>
            </form>
          </div>
        </div>
      </main>

      {/* Footer चाहिए तो नीचे वाली line uncomment कर दो */}
      {/* <Footer /> */}
    </>
  );
}
