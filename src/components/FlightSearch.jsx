import { useState } from "react";

export default function HomeHero() {
  const [trip, setTrip] = useState("oneway");
  const [from, setFrom] = useState("DEL - New Delhi");
  const [to, setTo] = useState("BOM - Mumbai");
  const [depart, setDepart] = useState("");
  const [ret, setRet] = useState("");
  const [pax, setPax] = useState(1);
  const [cls, setCls] = useState("Economy");
  const [freeCancel, setFreeCancel] = useState(false);

  const swap = () => {
    const a = from; setFrom(to); setTo(a);
  };

  function onSearch() {
    alert(JSON.stringify({ trip, from, to, depart, ret, pax, cls, freeCancel }, null, 2));
  }

  return (
    <section className="container-xl py-8">
      {/* Tabs */}
      <div className="flex gap-3">
        <button className={`btn-tab ${trip==='oneway'?'bg-emerald-600 text-white border-emerald-600':''}`} onClick={()=>setTrip('oneway')}>One Way</button>
        <button className={`btn-tab ${trip==='round'?'bg-emerald-600 text-white border-emerald-600':''}`} onClick={()=>setTrip('round')}>Round Trip</button>
      </div>

      {/* Search card */}
      <div className="card mt-3 p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_56px_1fr_1fr_1fr_220px] gap-3 items-center">
          {/* From */}
          <div className="relative">
            <label className="text-xs muted">From</label>
            <input className="input" value={from} onChange={e=>setFrom(e.target.value)} placeholder="City / Airport" />
          </div>

          {/* Swap */}
          <div className="hidden md:flex items-end justify-center pb-1">
            <button className="btn-icon" title="Swap" onClick={swap}>
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M7 7h11l-2.5-2.5 1.4-1.4L22.8 7l-5.9 3.9-1.4-1.4L18 8H7V7zm10 10H6l2.5 2.5-1.4 1.4L1.2 17l5.9-3.9 1.4 1.4L6 16h11v1z"/></svg>
            </button>
          </div>

          {/* To */}
          <div className="relative">
            <label className="text-xs muted">To</label>
            <input className="input" value={to} onChange={e=>setTo(e.target.value)} placeholder="City / Airport" />
          </div>

          {/* Depart */}
          <div>
            <label className="text-xs muted">Departure</label>
            <input type="date" className="input" value={depart} onChange={e=>setDepart(e.target.value)} />
          </div>

          {/* Return */}
          <div>
            <label className="text-xs muted">Return</label>
            <input type="date" className="input disabled:opacity-60" disabled={trip!=='round'} value={ret} onChange={e=>setRet(e.target.value)} />
          </div>

          {/* Travellers & Class + Search */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs muted">Travellers &amp; Class</label>
              <div className="grid grid-cols-2 gap-2">
                <select className="input" value={pax} onChange={e=>setPax(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>{n} Traveller{n>1?'s':''}</option>)}
                </select>
                <select className="input" value={cls} onChange={e=>setCls(e.target.value)}>
                  {["Economy","Premium Economy","Business","First"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button className="btn-primary w-36 self-end">Search →</button>
          </div>
        </div>

        {/* Special fares row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Special Fares (Optional):</span>
          {["Student","Senior Citizen","Armed Forces"].map(x=>(
            <button key={x} className="chip">{x}</button>
          ))}
          <span className="ml-auto hidden md:flex items-center gap-2 muted">
            <span className="pill bg-emerald-50 text-emerald-700">Hassle-Free Bookings</span>
          </span>
        </div>

        {/* Free cancellation strip */}
        <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2.5 flex flex-wrap items-center gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={freeCancel} onChange={e=>setFreeCancel(e.target.checked)} />
            <span>Always opt for Free Cancellation</span>
          </label>
          <span className="muted">₹0 cancellation fee</span>
          <span className="muted">No-questions-asked instant refunds</span>
          <span className="muted">Priority customer service</span>
          <span className="ml-auto">
            <img src="https://dummyimage.com/28x28/edf/fff.png&text=🛡️" alt="" className="w-7 h-7 rounded-full" />
          </span>
        </div>
      </div>
    </section>
  );
}
