// src/pages/dashboard/wallet/AddFundsPage.jsx
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  FileUp,
  Info,
  Landmark,
  ShieldCheck,
  Timer,
  X,
} from "lucide-react";

/**
 * Enterprise-style: Agent creates a TOP-UP REQUEST (PENDING).
 * Admin verifies (UTR / proof) and then credits wallet.
 *
 * ✅ No static colors: uses your theme CSS vars
 * Expected vars:
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft
 */

const METHODS = [
  {
    key: "UPI",
    label: "UPI",
    icon: <Banknote size={16} />,
    help: "Pay via UPI and enter the UTR / UPI reference for verification.",
    requires: ["utrOrRef"],
  },
  {
    key: "BANK",
    label: "Bank Transfer",
    icon: <Landmark size={16} />,
    help: "NEFT/RTGS/IMPS transfer. UTR is required for approval.",
    requires: ["utrOrRef", "bankName"],
  },
  {
    key: "CARD",
    label: "Debit/Credit Card",
    icon: <CreditCard size={16} />,
    help: "If enabled in your account, attach proof/screenshot for quick approval.",
    requires: [],
  },
];

const QUICK_AMOUNTS = [2000, 5000, 10000, 25000];

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

function formatINR(n) {
  try {
    return Number(n || 0).toLocaleString("en-IN");
  } catch {
    return String(n || 0);
  }
}

export default function AddFundsPage() {
  const nav = useNavigate();
  const fileRef = useRef(null);

  // form state
  const [amount, setAmount] = useState(5000);
  const [method, setMethod] = useState("UPI");
  const [utrOrRef, setUtrOrRef] = useState("");
  const [bankName, setBankName] = useState("");
  const [paidOn, setPaidOn] = useState(() => {
    // default now (local)
    const d = new Date();
    const pad = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  });
  const [remarks, setRemarks] = useState("");
  const [proofFile, setProofFile] = useState(null);

  // ui state
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const selectedMethod = useMemo(
    () => METHODS.find((m) => m.key === method) || METHODS[0],
    [method]
  );

  const errors = useMemo(() => {
    const e = {};
    const amt = Number(amount || 0);

    if (!amt || Number.isNaN(amt)) e.amount = "Enter a valid amount.";
    else if (amt < 100) e.amount = "Minimum top-up request is ₹100.";
    else if (amt > 10000000) e.amount = "Amount looks too high. Please verify.";

    // required fields based on method
    if (selectedMethod.requires.includes("utrOrRef")) {
      if (!utrOrRef.trim()) e.utrOrRef = "UTR / reference is required for verification.";
      else if (utrOrRef.trim().length < 6) e.utrOrRef = "Reference seems too short.";
    }

    if (selectedMethod.requires.includes("bankName")) {
      if (!bankName.trim()) e.bankName = "Bank name is required for bank transfer.";
    }

    if (!paidOn) e.paidOn = "Select payment date/time.";

    // proof is optional, but recommended
    // (no hard error)

    return e;
  }, [amount, utrOrRef, bankName, paidOn, selectedMethod]);

  const isValid = Object.keys(errors).length === 0;

  const markTouched = (k) => setTouched((p) => ({ ...p, [k]: true }));

  const submit = async () => {
    // mark all important fields touched
    setTouched((p) => ({
      ...p,
      amount: true,
      utrOrRef: true,
      bankName: true,
      paidOn: true,
    }));

    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      // ✅ Replace with real API:
      // POST /wallet/topup-requests
      // payload: { amount, method, utrOrRef, bankName, paidOn, remarks, proofFile }
      const payload = {
        amount: Number(amount),
        method,
        utrOrRef: utrOrRef.trim() || null,
        bankName: bankName.trim() || null,
        paidOn,
        remarks: remarks.trim() || null,
        proof: proofFile ? { name: proofFile.name, size: proofFile.size, type: proofFile.type } : null,
        status: "PENDING",
      };

      console.log("TOPUP_REQUEST_CREATE", payload);

      // demo delay
      await new Promise((r) => setTimeout(r, 600));

      // ✅ navigate to wallet page (or request list page)
      nav("/admin/wallet", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Could not submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--surface2)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[240px]">
            <div className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
              <button
                onClick={() => nav("/admin/wallet")}
                className="hover:underline"
                type="button"
              >
                Wallet
              </button>
              <span className="opacity-60">/</span>
              <span>Add Funds Request</span>
            </div>

            <h1 className="mt-1 text-xl font-semibold">Add Funds (Request)</h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Create a top-up request. Admin will verify payment details and credit your wallet.
            </p>
          </div>

          <button
            onClick={() => nav(-1)}
            className={cx(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold",
              "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
            )}
            type="button"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Form Card */}
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="border-b border-[color:var(--border)] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primarySoft)]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Top-up request details</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    Provide accurate reference details for faster approval.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              {/* Amount */}
              <div>
                <label className="text-[11px] font-semibold text-[var(--muted)]">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min={100}
                  value={amount}
                  onBlur={() => markTouched("amount")}
                  onChange={(e) => setAmount(Number(e.target.value || 0))}
                  className={cx(
                    "mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none",
                    "bg-[var(--surface)]",
                    "border-[color:var(--border)] focus:border-[color:var(--primary)]",
                    touched.amount && errors.amount && "border-[color:var(--primary)]"
                  )}
                />
                {touched.amount && errors.amount && (
                  <div className="mt-1 text-[11px] text-[var(--muted)]">
                    {errors.amount}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(a)}
                      className={cx(
                        "rounded-full border px-3 py-1 text-[11px] font-semibold",
                        "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                      )}
                    >
                      ₹{formatINR(a)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-[11px] font-semibold text-[var(--muted)]">
                  Payment Method
                </label>

                <div className="mt-2 flex flex-wrap gap-2">
                  {METHODS.map((m) => {
                    const active = method === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setMethod(m.key)}
                        className={cx(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold transition",
                          active
                            ? "border-[color:var(--primary)] bg-[var(--primarySoft)]"
                            : "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                        )}
                      >
                        {m.icon}
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 inline-flex items-start gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] px-3 py-2 text-[11px] text-[var(--muted)]">
                  <Info size={14} className="mt-0.5" />
                  <span>{selectedMethod.help}</span>
                </div>
              </div>

              {/* Conditional fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(method === "UPI" || method === "BANK") && (
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-[var(--muted)]">
                      UTR / UPI Reference
                      {selectedMethod.requires.includes("utrOrRef") ? (
                        <span className="ml-1 opacity-70">(required)</span>
                      ) : null}
                    </label>
                    <input
                      value={utrOrRef}
                      onBlur={() => markTouched("utrOrRef")}
                      onChange={(e) => setUtrOrRef(e.target.value)}
                      placeholder="e.g. 3256XXXXXX / UPI Ref / UTR"
                      className={cx(
                        "mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none",
                        "bg-[var(--surface)]",
                        "border-[color:var(--border)] focus:border-[color:var(--primary)]",
                        touched.utrOrRef && errors.utrOrRef && "border-[color:var(--primary)]"
                      )}
                    />
                    {touched.utrOrRef && errors.utrOrRef && (
                      <div className="mt-1 text-[11px] text-[var(--muted)]">
                        {errors.utrOrRef}
                      </div>
                    )}
                  </div>
                )}

                {method === "BANK" && (
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--muted)]">
                      Bank Name <span className="ml-1 opacity-70">(required)</span>
                    </label>
                    <input
                      value={bankName}
                      onBlur={() => markTouched("bankName")}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC / ICICI / SBI"
                      className={cx(
                        "mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none",
                        "bg-[var(--surface)]",
                        "border-[color:var(--border)] focus:border-[color:var(--primary)]",
                        touched.bankName && errors.bankName && "border-[color:var(--primary)]"
                      )}
                    />
                    {touched.bankName && errors.bankName && (
                      <div className="mt-1 text-[11px] text-[var(--muted)]">
                        {errors.bankName}
                      </div>
                    )}
                  </div>
                )}

                <div className={cx(method === "BANK" ? "" : "md:col-span-2")}>
                  <label className="text-[11px] font-semibold text-[var(--muted)]">
                    Payment Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={paidOn}
                    onBlur={() => markTouched("paidOn")}
                    onChange={(e) => setPaidOn(e.target.value)}
                    className={cx(
                      "mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none",
                      "bg-[var(--surface)]",
                      "border-[color:var(--border)] focus:border-[color:var(--primary)]",
                      touched.paidOn && errors.paidOn && "border-[color:var(--primary)]"
                    )}
                  />
                  {touched.paidOn && errors.paidOn && (
                    <div className="mt-1 text-[11px] text-[var(--muted)]">
                      {errors.paidOn}
                    </div>
                  )}
                </div>
              </div>

              {/* Proof upload */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">
                    Payment Proof (recommended)
                  </label>
                  {proofFile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProofFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)] hover:underline"
                    >
                      <X size={14} /> Remove
                    </button>
                  ) : null}
                </div>

                <div className="mt-2 flex flex-col gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <FileUp size={16} />
                      <span className="font-semibold">Upload screenshot / receipt</span>
                      <span className="text-[11px] text-[var(--muted)]">(PNG/JPG/PDF)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className={cx(
                        "rounded-md border px-3 py-1.5 text-[11px] font-semibold",
                        "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                      )}
                    >
                      Choose File
                    </button>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setProofFile(f);
                    }}
                  />

                  {proofFile ? (
                    <div className="text-[11px] text-[var(--muted)]">
                      <span className="font-semibold text-[var(--text)]">{proofFile.name}</span>{" "}
                      • {(proofFile.size / 1024).toFixed(1)} KB
                    </div>
                  ) : (
                    <div className="text-[11px] text-[var(--muted)]">
                      Optional, but helps admin approve faster.
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-[11px] font-semibold text-[var(--muted)]">
                  Remarks (optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any internal note for admin (e.g. paid from company UPI, urgent booking, etc.)"
                  rows={3}
                  className={cx(
                    "mt-1 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none",
                    "bg-[var(--surface)]",
                    "border-[color:var(--border)] focus:border-[color:var(--primary)]"
                  )}
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] p-5">
              <button
                onClick={() => nav("/admin/wallet")}
                type="button"
                className={cx(
                  "rounded-md border px-4 py-2 text-xs font-semibold",
                  "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
                )}
              >
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={!isValid || submitting}
                type="button"
                className={cx(
                  "inline-flex min-w-[220px] items-center justify-center gap-2 rounded-md px-4 py-2 text-xs font-semibold",
                  !isValid || submitting
                    ? "cursor-not-allowed opacity-60 bg-[var(--primarySoft)]"
                    : "bg-[var(--primary)] hover:bg-[var(--primaryHover)]",
                  "text-white"
                )}
              >
                {submitting ? (
                  <>
                    <Timer size={16} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Submit Request (Admin Approval)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Summary / Policy Card */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm">
              <div className="border-b border-[color:var(--border)] p-5">
                <div className="text-sm font-semibold">Request summary</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  Review before submitting.
                </div>
              </div>

              <div className="space-y-3 p-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted)]">Amount</span>
                  <span className="font-semibold">₹{formatINR(amount)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted)]">Method</span>
                  <span className="font-semibold">{selectedMethod.label}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted)]">Reference</span>
                  <span className="font-semibold">
                    {utrOrRef?.trim() ? utrOrRef.trim() : "—"}
                  </span>
                </div>

                {method === "BANK" && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[var(--muted)]">Bank</span>
                    <span className="font-semibold">{bankName?.trim() || "—"}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted)]">Paid on</span>
                  <span className="font-semibold">{paidOn ? paidOn.replace("T", " ") : "—"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted)]">Proof</span>
                  <span className="font-semibold">{proofFile ? "Attached" : "Not attached"}</span>
                </div>

                <div className="mt-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface2)] p-3 text-[11px] text-[var(--muted)]">
                  <div className="mb-1 flex items-center gap-2 font-semibold text-[var(--text)]">
                    <Banknote size={14} />
                    What happens next?
                  </div>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Your request is created with <b>PENDING</b> status.</li>
                    <li>Admin verifies reference/proof and credits your wallet.</li>
                    <li>You’ll be able to book tickets once funds are approved.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primarySoft)]">
                  <Timer size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Approval tips</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    To reduce approval time:
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--muted)]">
                    <li>Enter correct UTR/UPI reference (most important).</li>
                    <li>Attach payment proof screenshot/receipt.</li>
                    <li>Use remarks for urgent booking context.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky bottom hint on mobile */}
        <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-3 text-[11px] text-[var(--muted)] lg:hidden">
          <div className="flex items-start gap-2">
            <Info size={14} className="mt-0.5" />
            <span>
              This is a <b>request</b> flow. Wallet balance updates after admin approval.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
