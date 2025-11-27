import React, { useMemo, useState } from "react";

type PaymentGateway = {
  id: string;
  name: string;
  description: string;
  type: "upi" | "card" | "netbanking" | "mixed";
};

const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: "razorpay",
    name: "Razorpay",
    description: "UPI, Cards, Netbanking, Wallets – all in one gateway",
    type: "mixed",
  },
  {
    id: "payu",
    name: "PayU",
    description: "Credit / Debit cards, Netbanking & UPI",
    type: "mixed",
  },
  {
    id: "ccavenue",
    name: "CCAvenue",
    description: "Multi-bank netbanking and international cards",
    type: "mixed",
  },
];

const PaymentConfirmationPage: React.FC = () => {
  /* ================== Mock booking data (normally from state/router) ================== */
  const baseFareTotal = 4700; // e.g. traveller fare
  const seatCharges = 250;
  const serviceFee = 0;
  const taxes = 0;
  const grossPayable = baseFareTotal + seatCharges + serviceFee + taxes;

  const walletBalance = 5000; // agent wallet balance fetched from API

  /* ================== Payment state ================== */
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>("razorpay");
  const [useWallet, setUseWallet] = useState<boolean>(true);

  const maxWalletUsage = useMemo(
    () => Math.min(walletBalance, grossPayable),
    [walletBalance, grossPayable]
  );

  const [walletUsage, setWalletUsage] = useState<number>(maxWalletUsage);

  const handleWalletToggle = () => {
    setUseWallet((prev) => !prev);
  };

  const handleWalletInputChange = (value: string) => {
    const num = Number(value.replace(/[^\d]/g, ""));
    if (Number.isNaN(num)) return;

    const clamped = Math.max(0, Math.min(num, maxWalletUsage));
    setWalletUsage(clamped);
  };

  const amountToPayOnline = useMemo(() => {
    if (!useWallet) return grossPayable;
    return Math.max(0, grossPayable - walletUsage);
  }, [grossPayable, useWallet, walletUsage]);

  const selectedGateway = PAYMENT_GATEWAYS.find(
    (g) => g.id === selectedGatewayId
  );

  const handleConfirmPayment = () => {
    const payload = {
      amount: grossPayable,
      useWallet,
      walletAmount: useWallet ? walletUsage : 0,
      gateway: selectedGatewayId,
    };

    console.log("CONFIRM PAYMENT PAYLOAD:", payload);

    // yaha se:
    // 1) /create-order API call
    // 2) response se paymentUrl / form generate
    // 3) redirect to gateway
  };

  /* ================== Render ================== */

  return (
    <div className="min-h-screen bg-slate-50">


      {/* Page heading */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-4 md:flex-row md:items-center">
          <div>
            <h1
              className="
                text-2xl md:text-3xl font-semibold
                bg-gradient-to-r from-[#004aad] via-[#1b5fb9] to-[#00bcd4]
                bg-clip-text text-transparent
              "
            >
              Confirm your booking &amp; choose payment
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-500">
              Review passenger &amp; fare details, then pay using Agent Wallet
              and preferred payment gateway.
            </p>
          </div>

          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
            Secure payment • Encrypted gateway
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-0 py-4 lg:flex-row">
        {/* LEFT SIDE */}
        <div className="flex-1 space-y-4">
          {/* Review section (summary placeholders) */}
          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              Review booking
            </h2>

            {/* Flight summary line */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-xs md:text-sm text-slate-600">
                <div className="font-medium text-slate-800">
                  Delhi (DEL) → Mumbai (BOM)
                </div>
                <div>SpiceJet • SG 915 • Economy</div>
                <div className="mt-1 text-[11px] text-slate-500">
                  28 Nov 2025 · 06:55 → 09:20 · Non-stop
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Travellers: 1 Adult
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Seats selected: 1
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Fare type: Refundable
                </span>
              </div>
            </div>

            <hr className="my-3 border-dashed border-slate-200" />

            {/* Passenger list placeholder */}
            <div className="space-y-2 text-xs md:text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">
                    Adult 1 – Mr Demo Passenger
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Seat: 15C · As per ID
                  </div>
                </div>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Edit details
                </button>
              </div>
            </div>
          </section>

          {/* PAYMENT OPTIONS */}
          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">
                Payment options
              </h2>
              <span className="text-[11px] text-slate-500">
                Complete payment to generate e-ticket &amp; PNR
              </span>
            </div>

            {/* Wallet block */}
            <div className="mt-4 rounded-lg border border-dashed border-amber-200 bg-amber-50/60 p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={useWallet}
                        onChange={handleWalletToggle}
                      />
                      <span>Use Agent Wallet</span>
                    </label>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                      Balance: ₹{walletBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    You can adjust how much to use from wallet. Remaining amount
                    will be paid via selected payment gateway.
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-2 md:mt-0">
                  <span className="text-[11px] text-slate-500">
                    Use wallet up to
                  </span>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-800 shadow-sm">
                    ₹{maxWalletUsage.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Wallet amount input */}
              {useWallet && (
                <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Amount to use from wallet
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                        ₹
                      </span>
                      <input
                        type="text"
                        value={walletUsage.toString()}
                        onChange={(e) => handleWalletInputChange(e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-7 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Max usable: ₹{maxWalletUsage.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-xs text-right text-slate-500 md:text-[11px]">
                    Remaining to pay online:{" "}
                    <span className="font-semibold text-slate-900">
                      ₹{amountToPayOnline.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Gateway list */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-slate-600">
                Select payment gateway
              </p>

              <div className="space-y-2">
                {PAYMENT_GATEWAYS.map((gw) => (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setSelectedGatewayId(gw.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs md:text-sm transition ${
                      selectedGatewayId === gw.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex size-4 items-center justify-center rounded-full border text-[10px] ${
                            selectedGatewayId === gw.id
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white text-transparent"
                          }`}
                        >
                          ●
                        </span>
                        <span className="font-medium text-slate-800">
                          {gw.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {gw.description}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                      {gw.type === "upi" && "UPI"}
                      {gw.type === "card" && "Cards"}
                      {gw.type === "netbanking" && "Netbanking"}
                      {gw.type === "mixed" && "UPI • Cards • Netbanking"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="mt-4 flex items-start gap-2">
              <input
                id="agree"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="agree"
                className="text-[11px] leading-relaxed text-slate-500"
              >
                I confirm that passenger names match their government ID / passport
                and I agree to fare rules, cancellation &amp; change policies.
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT SIDE – Fare summary */}
        <aside className="w-full shrink-0 space-y-4 lg:w-80">
          <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Fare summary
            </h2>

            <dl className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <dt>Traveller fare</dt>
                <dd>₹{baseFareTotal.toLocaleString("en-IN")}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Seat selection</dt>
                <dd>₹{seatCharges.toLocaleString("en-IN")}</dd>
              </div>
              {serviceFee > 0 && (
                <div className="flex justify-between">
                  <dt>Service / Convenience fee</dt>
                  <dd>₹{serviceFee.toLocaleString("en-IN")}</dd>
                </div>
              )}
              {taxes > 0 && (
                <div className="flex justify-between">
                  <dt>Taxes &amp; surcharges</dt>
                  <dd>₹{taxes.toLocaleString("en-IN")}</dd>
                </div>
              )}

              <hr className="my-2 border-dashed border-slate-200" />

              {useWallet && walletUsage > 0 && (
                <div className="flex justify-between text-[11px] text-emerald-700">
                  <dt>Wallet adjustment</dt>
                  <dd>- ₹{walletUsage.toLocaleString("en-IN")}</dd>
                </div>
              )}

              <div className="flex items-baseline justify-between pt-1">
                <dt className="text-xs font-semibold text-slate-700">
                  Total payable now
                </dt>
                <dd className="text-lg font-semibold text-slate-900">
                  ₹{amountToPayOnline.toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>

            {useWallet && (
              <p className="mt-1 text-[11px] text-slate-500">
                Remaining amount (₹
                {(grossPayable - walletUsage).toLocaleString("en-IN")}) will be
                charged via{" "}
                <span className="font-medium text-slate-700">
                  {selectedGateway?.name}
                </span>
                .
              </p>
            )}

            <button
              type="button"
              onClick={handleConfirmPayment}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Continue to payment
            </button>

            <p className="mt-2 text-[10px] text-slate-400">
              You will be redirected to the selected payment gateway to complete
              the transaction. Please do not refresh or close the window during
              payment.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PaymentConfirmationPage;
