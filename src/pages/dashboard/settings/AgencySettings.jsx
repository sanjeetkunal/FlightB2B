import { useState } from "react";

const TABS = [
  { key: "profile", label: "Profile & KYC" },
  { key: "booking", label: "Booking & Markup" },
  { key: "invoice", label: "Invoice & GST" },
  { key: "notifications", label: "Notifications" },
  { key: "payout", label: "Payout & Bank" },
];

export default function AgencySettings() {
  const [activeTab, setActiveTab] = useState("profile");

  // ==== mock state (replace with API data in useEffect) ====
  const [profile, setProfile] = useState({
    agencyName: "Next Travel World",
    tradeName: "Next Travel World B2B",
    businessType: "PROPRIETOR",
    pan: "ABCDE1234F",
    gst: "22ABCDE1234F1Z5",
    iataStatus: "NO",
    email: "sales@nexttravel.com",
    phone: "+91-9876543210",
    altPhone: "",
    address: "301, Business Tower, Main Road",
    city: "Delhi",
    state: "Delhi",
    pincode: "110092",
    logoUrl: "",
  });

  const [booking, setBooking] = useState({
    defaultTrip: "ONEWAY",
    defaultSort: "CHEAPEST",
    showNetFare: true,
    allowHold: true,
    holdTimeHours: 4,
    flightDomesticMarkupType: "PER_TICKET", // PER_TICKET / PER_PAX / PERCENT
    flightDomesticMarkupValue: 200,
    flightIntlMarkupType: "PERCENT",
    flightIntlMarkupValue: 5,
    roundingMode: "ROUND_10", // NONE / ROUND_10 / ROUND_50 / ROUND_100
    hideMarkupOnTicket: false,
  });

  const [invoice, setInvoice] = useState({
    gstName: "Next Travel World",
    gstNumber: "22ABCDE1234F1Z5",
    gstAddress: "301, Business Tower, Main Road, Delhi - 110092",
    invoiceType: "B2B",
    showServiceCharge: true,
    footerNote: "This is a computer generated document and does not require signature.",
  });

  const [notifications, setNotifications] = useState({
    emailBooking: true,
    emailTicketed: true,
    emailCancel: true,
    emailRefund: true,
    emailWallet: true,
    smsBooking: false,
    smsTicketed: false,
    smsCancel: false,
    dailyReport: true,
    weeklyReport: false,
    quietHours: false,
    quietFrom: "23:00",
    quietTo: "07:00",
  });

  const [payout, setPayout] = useState({
    accountName: "Next Travel World",
    accountNumber: "123456789012",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank",
    branch: "Noida Sec 62",
    payoutMode: "NEFT",
  });

  // ==== generic change helpers ====
  const updateProfile = (field, value) =>
    setProfile((prev) => ({ ...prev, [field]: value }));
  const updateBooking = (field, value) =>
    setBooking((prev) => ({ ...prev, [field]: value }));
  const updateInvoice = (field, value) =>
    setInvoice((prev) => ({ ...prev, [field]: value }));
  const updateNotifications = (field, value) =>
    setNotifications((prev) => ({ ...prev, [field]: value }));
  const updatePayout = (field, value) =>
    setPayout((prev) => ({ ...prev, [field]: value }));

  // ==== Save handlers (wire to API) ====
  const handleSaveProfile = () => {
    console.log("Save profile payload:", profile);
    // TODO: call /api/agency/profile
    alert("Profile & KYC settings saved (demo).");
  };

  const handleSaveBooking = () => {
    console.log("Save booking settings:", booking);
    // TODO: call /api/agency/booking-settings
    alert("Booking & markup settings saved (demo).");
  };

  const handleSaveInvoice = () => {
    console.log("Save invoice settings:", invoice);
    // TODO: call /api/agency/invoice-settings
    alert("Invoice & GST settings saved (demo).");
  };

  const handleSaveNotifications = () => {
    console.log("Save notifications:", notifications);
    // TODO: call /api/agency/notification-settings
    alert("Notification settings saved (demo).");
  };

  const handleSavePayout = () => {
    console.log("Save payout settings:", payout);
    // TODO: call /api/agency/payout-settings
    alert("Payout & bank settings saved (demo).");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Page header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Agency Settings
            </h1>
            <p className="text-xs text-slate-500 max-w-xl mt-1">
              Configure your agency profile, flight booking preferences, markup rules,
              invoice format, notifications and payout bank details for the B2B flight
              panel.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 bg-slate-100 rounded-full px-3 py-1">
            ID: <span className="font-semibold text-slate-700">V2A-2217</span> · KYC
            Verified
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "px-3 sm:px-4 h-9 text-xs sm:text-[13px] font-medium border-b-2 -mb-px",
                    active
                      ? "border-sky-600 text-sky-700 bg-sky-50 rounded-t-lg"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {activeTab === "profile" && (
            <ProfileTab
              profile={profile}
              onChange={updateProfile}
              onSave={handleSaveProfile}
            />
          )}
          {activeTab === "booking" && (
            <BookingTab
              booking={booking}
              onChange={updateBooking}
              onSave={handleSaveBooking}
            />
          )}
          {activeTab === "invoice" && (
            <InvoiceTab
              invoice={invoice}
              onChange={updateInvoice}
              onSave={handleSaveInvoice}
            />
          )}
          {activeTab === "notifications" && (
            <NotificationsTab
              notifications={notifications}
              onChange={updateNotifications}
              onSave={handleSaveNotifications}
            />
          )}
          {activeTab === "payout" && (
            <PayoutTab
              payout={payout}
              onChange={updatePayout}
              onSave={handleSavePayout}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ===================== TABS ===================== */

function ProfileTab({ profile, onChange, onSave }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-5">
      <SectionHeader
        title="Agency Profile & KYC"
        desc="Update your agency details. PAN & GST details are used for invoicing and compliance."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Agency / Legal Name"
          required
          value={profile.agencyName}
          onChange={(e) => onChange("agencyName", e.target.value)}
        />
        <Field
          label="Trade / Display Name"
          value={profile.tradeName}
          onChange={(e) => onChange("tradeName", e.target.value)}
          helper="This name will appear on tickets & invoices."
        />
        <div>
          <Label>
            Business Type <span className="text-red-500">*</span>
          </Label>
          <select
            className="input"
            value={profile.businessType}
            onChange={(e) => onChange("businessType", e.target.value)}
          >
            <option value="PROPRIETOR">Proprietorship</option>
            <option value="PARTNERSHIP">Partnership</option>
            <option value="PVT_LTD">Private Limited</option>
            <option value="LLP">LLP</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* PAN / GST */}
        <div>
          <Label>PAN (read-only after KYC)</Label>
          <input
            className="input uppercase bg-slate-50 cursor-not-allowed"
            value={profile.pan}
            readOnly
          />
          <Helper>For any PAN change, please contact support.</Helper>
        </div>

        <div>
          <Label>GST Number</Label>
          <input
            className="input uppercase"
            value={profile.gst}
            onChange={(e) => onChange("gst", e.target.value)}
          />
          <Helper>Leave blank if you do not want GST invoices.</Helper>
        </div>

        <div>
          <Label>IATA Accredited?</Label>
          <div className="flex gap-4 text-xs mt-1">
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="iata-status"
                className="h-3 w-3"
                checked={profile.iataStatus === "YES"}
                onChange={() => onChange("iataStatus", "YES")}
              />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="iata-status"
                className="h-3 w-3"
                checked={profile.iataStatus === "NO"}
                onChange={() => onChange("iataStatus", "NO")}
              />
              <span>No</span>
            </label>
          </div>
        </div>
      </div>

      {/* Contact / Address */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <SectionHeader
          small
          title="Contact & Address"
          desc="These details are used for invoices and communication."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Official Email"
            required
            type="email"
            value={profile.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
          <Field
            label="Primary Phone"
            required
            value={profile.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
          <Field
            label="Alternate Phone (optional)"
            value={profile.altPhone}
            onChange={(e) => onChange("altPhone", e.target.value)}
          />
          <Field
            label="Address"
            required
            value={profile.address}
            onChange={(e) => onChange("address", e.target.value)}
          />
          <Field
            label="City"
            required
            value={profile.city}
            onChange={(e) => onChange("city", e.target.value)}
          />
          <Field
            label="State"
            required
            value={profile.state}
            onChange={(e) => onChange("state", e.target.value)}
          />
          <Field
            label="Pincode"
            required
            value={profile.pincode}
            onChange={(e) => onChange("pincode", e.target.value)}
          />
        </div>
      </div>

      {/* Logo */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <SectionHeader
          small
          title="Brand Logo"
          desc="Your logo will appear on tickets, invoices and vouchers."
        />
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-24 h-24 rounded-md border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[11px] text-slate-400">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt="Agency Logo"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span>Logo preview</span>
            )}
          </div>
          <div className="flex-1 text-xs space-y-2">
            <input
              type="file"
              accept="image/*"
              className="input-file"
              onChange={(e) =>
                onChange(
                  "logoUrl",
                  e.target.files?.[0]
                    ? URL.createObjectURL(e.target.files[0])
                    : ""
                )
              }
            />
            <p className="text-[10px] text-slate-500">
              Recommended size: 400x120 px, PNG with transparent background.
            </p>
          </div>
        </div>
      </div>

      <FooterSaveBar onSave={onSave} />
    </div>
  );
}

function BookingTab({ booking, onChange, onSave }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-5">
      <SectionHeader
        title="Flight Booking & Markup"
        desc="Control how your flight search, pricing and markup behaves in the B2B portal."
      />

      {/* Default booking behaviour */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Default Trip Type</Label>
          <select
            className="input"
            value={booking.defaultTrip}
            onChange={(e) => onChange("defaultTrip", e.target.value)}
          >
            <option value="ONEWAY">Oneway</option>
            <option value="ROUND">Round Trip</option>
            <option value="MULTICITY">Multi City</option>
          </select>
        </div>

        <div>
          <Label>Default Sort in Results</Label>
          <select
            className="input"
            value={booking.defaultSort}
            onChange={(e) => onChange("defaultSort", e.target.value)}
          >
            <option value="CHEAPEST">Cheapest First</option>
            <option value="EARLIEST">Earliest Departure</option>
            <option value="NONSTOP">Non-stop First</option>
          </select>
        </div>

        <div className="flex items-center gap-3 mt-5 md:mt-0">
          <Toggle
            checked={booking.showNetFare}
            onChange={(v) => onChange("showNetFare", v)}
          />
          <div className="text-xs">
            <div className="font-semibold text-slate-800">
              Show Net Fare by default
            </div>
            <div className="text-[10px] text-slate-500">
              Display net (B2B) fare first instead of published fare.
            </div>
          </div>
        </div>
      </div>

      {/* Hold & auto-ticket */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <SectionHeader
          small
          title="Hold & Ticketing Preferences"
          desc="These are subject to airline and system rules."
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Toggle
              checked={booking.allowHold}
              onChange={(v) => onChange("allowHold", v)}
            />
            <div className="text-xs">
              <div className="font-semibold text-slate-800">
                Allow PNR hold for eligible flights
              </div>
              <div className="text-[10px] text-slate-500">
                When enabled, you will see &quot;Hold&quot; option wherever airline
                supports time-limit booking.
              </div>
            </div>
          </div>
          {booking.allowHold && (
            <div className="flex items-center gap-2 text-xs">
              <Label>Default hold time</Label>
              <input
                type="number"
                min={1}
                max={24}
                className="input w-20"
                value={booking.holdTimeHours}
                onChange={(e) =>
                  onChange("holdTimeHours", Number(e.target.value || 0))
                }
              />
              <span className="text-[11px] text-slate-500">hours</span>
            </div>
          )}
        </div>
      </div>

      {/* Markup controls */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <SectionHeader
          small
          title="Flight Markup Rules"
          desc="These preferences control how your markup is applied on B2B fares."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {/* Domestic */}
          <div className="rounded-md border border-slate-200 bg-slate-50/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-800">
                Domestic Flights
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                India Sector
              </span>
            </div>
            <div className="grid gap-2 text-xs">
              <div>
                <Label>Markup Type</Label>
                <select
                  className="input"
                  value={booking.flightDomesticMarkupType}
                  onChange={(e) =>
                    onChange("flightDomesticMarkupType", e.target.value)
                  }
                >
                  <option value="PER_TICKET">Fixed per Ticket (₹)</option>
                  <option value="PER_PAX">Fixed per Pax (₹)</option>
                  <option value="PERCENT">% of Base Fare</option>
                </select>
              </div>
              <div>
                <Label>Markup Value</Label>
                <input
                  type="number"
                  className="input"
                  value={booking.flightDomesticMarkupValue}
                  onChange={(e) =>
                    onChange(
                      "flightDomesticMarkupValue",
                      Number(e.target.value || 0)
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* International */}
          <div className="rounded-md border border-slate-200 bg-slate-50/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-800">
                International Flights
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                Ex-India & Ex-Intl
              </span>
            </div>
            <div className="grid gap-2 text-xs">
              <div>
                <Label>Markup Type</Label>
                <select
                  className="input"
                  value={booking.flightIntlMarkupType}
                  onChange={(e) =>
                    onChange("flightIntlMarkupType", e.target.value)
                  }
                >
                  <option value="PER_TICKET">Fixed per Ticket (₹)</option>
                  <option value="PER_PAX">Fixed per Pax (₹)</option>
                  <option value="PERCENT">% of Base Fare</option>
                </select>
              </div>
              <div>
                <Label>Markup Value</Label>
                <input
                  type="number"
                  className="input"
                  value={booking.flightIntlMarkupValue}
                  onChange={(e) =>
                    onChange(
                      "flightIntlMarkupValue",
                      Number(e.target.value || 0)
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rounding & display */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Rounding Preference</Label>
            <select
              className="input"
              value={booking.roundingMode}
              onChange={(e) => onChange("roundingMode", e.target.value)}
            >
              <option value="NONE">No rounding</option>
              <option value="ROUND_10">Nearest ₹10</option>
              <option value="ROUND_50">Nearest ₹50</option>
              <option value="ROUND_100">Nearest ₹100</option>
            </select>
            <Helper>
              Rounding is applied on final selling fare shown to you / on B2C ticket.
            </Helper>
          </div>

          <div className="flex items-start gap-3 mt-1">
            <Toggle
              checked={booking.hideMarkupOnTicket}
              onChange={(v) => onChange("hideMarkupOnTicket", v)}
            />
            <div className="text-xs">
              <div className="font-semibold text-slate-800">
                Hide markup breakup on print ticket
              </div>
              <div className="text-[10px] text-slate-500">
                If enabled, passenger-facing ticket will not show your margin as a
                separate line.
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterSaveBar onSave={onSave} />
    </div>
  );
}

function InvoiceTab({ invoice, onChange, onSave }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-5">
      <SectionHeader
        title="Invoice & GST Settings"
        desc="Control how your GST invoices and ticket headers appear for your customers."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Legal Name (as per GST)"
          required
          value={invoice.gstName}
          onChange={(e) => onChange("gstName", e.target.value)}
        />
        <Field
          label="GST Number"
          value={invoice.gstNumber}
          onChange={(e) => onChange("gstNumber", e.target.value)}
        />
        <div className="md:col-span-2">
          <Field
            label="GST Registered Address"
            required
            value={invoice.gstAddress}
            onChange={(e) => onChange("gstAddress", e.target.value)}
          />
        </div>
        <div>
          <Label>Default Invoice Type</Label>
          <select
            className="input"
            value={invoice.invoiceType}
            onChange={(e) => onChange("invoiceType", e.target.value)}
          >
            <option value="B2B">B2B Invoice (Net fare)</option>
            <option value="B2C">B2C Invoice (With markup)</option>
          </select>
        </div>
        <div className="flex items-start gap-3 mt-1">
          <Toggle
            checked={invoice.showServiceCharge}
            onChange={(v) => onChange("showServiceCharge", v)}
          />
          <div className="text-xs">
            <div className="font-semibold text-slate-800">
              Show service charge separately
            </div>
            <div className="text-[10px] text-slate-500">
              Displays convenience/service fee as a separate line item on invoice.
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-3">
        <SectionHeader
          small
          title="Default Invoice Footer / Notes"
          desc="Shown at the bottom of all tickets & invoices."
        />
        <textarea
          className="input min-h-[80px]"
          value={invoice.footerNote}
          onChange={(e) => onChange("footerNote", e.target.value)}
        />
      </div>

      <FooterSaveBar onSave={onSave} />
    </div>
  );
}

function NotificationsTab({ notifications, onChange, onSave }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-5">
      <SectionHeader
        title="Notification & Alerts"
        desc="Control which events you want to be notified for on email and SMS."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SettingBlock title="Email Alerts">
          <CheckRow
            label="New booking created"
            checked={notifications.emailBooking}
            onChange={(v) => onChange("emailBooking", v)}
          />
          <CheckRow
            label="Ticket issued"
            checked={notifications.emailTicketed}
            onChange={(v) => onChange("emailTicketed", v)}
          />
          <CheckRow
            label="Cancellation processed"
            checked={notifications.emailCancel}
            onChange={(v) => onChange("emailCancel", v)}
          />
          <CheckRow
            label="Refund processed"
            checked={notifications.emailRefund}
            onChange={(v) => onChange("emailRefund", v)}
          />
          <CheckRow
            label="Low wallet balance / topup alerts"
            checked={notifications.emailWallet}
            onChange={(v) => onChange("emailWallet", v)}
          />
        </SettingBlock>

        <SettingBlock title="SMS / WhatsApp Alerts">
          <CheckRow
            label="Booking confirmation"
            checked={notifications.smsBooking}
            onChange={(v) => onChange("smsBooking", v)}
          />
          <CheckRow
            label="Ticket issued"
            checked={notifications.smsTicketed}
            onChange={(v) => onChange("smsTicketed", v)}
          />
          <CheckRow
            label="Cancellation / refund status"
            checked={notifications.smsCancel}
            onChange={(v) => onChange("smsCancel", v)}
          />
          <Helper>
            SMS / WhatsApp charges may apply as per your plan. Passenger SMS can be
            configured per booking.
          </Helper>
        </SettingBlock>
      </div>

      <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-slate-100">
        <SettingBlock title="Auto Reports">
          <CheckRow
            label="Daily booking summary (email)"
            checked={notifications.dailyReport}
            onChange={(v) => onChange("dailyReport", v)}
          />
          <CheckRow
            label="Weekly sales report (email)"
            checked={notifications.weeklyReport}
            onChange={(v) => onChange("weeklyReport", v)}
          />
        </SettingBlock>

        <SettingBlock title="Quiet Hours (Do not disturb)">
          <div className="flex items-start gap-3">
            <Toggle
              checked={notifications.quietHours}
              onChange={(v) => onChange("quietHours", v)}
            />
            <div className="text-xs">
              <div className="font-semibold text-slate-800">
                Limit SMS during night
              </div>
              <div className="text-[10px] text-slate-500">
                SMS alerts will be paused during this window where permitted by
                regulations.
              </div>
              {notifications.quietHours && (
                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <span>From</span>
                  <input
                    type="time"
                    className="input w-28"
                    value={notifications.quietFrom}
                    onChange={(e) =>
                      onChange("quietFrom", e.target.value)
                    }
                  />
                  <span>to</span>
                  <input
                    type="time"
                    className="input w-28"
                    value={notifications.quietTo}
                    onChange={(e) =>
                      onChange("quietTo", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </SettingBlock>
      </div>

      <FooterSaveBar onSave={onSave} />
    </div>
  );
}

function PayoutTab({ payout, onChange, onSave }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm p-4 sm:p-6 space-y-5">
      <SectionHeader
        title="Payout & Bank Details"
        desc="We use these details for settling your incentives and commission payouts."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Account Holder Name"
          required
          value={payout.accountName}
          onChange={(e) => onChange("accountName", e.target.value)}
        />
        <Field
          label="Bank Name"
          required
          value={payout.bankName}
          onChange={(e) => onChange("bankName", e.target.value)}
        />
        <Field
          label="Branch"
          value={payout.branch}
          onChange={(e) => onChange("branch", e.target.value)}
        />
        <Field
          label="Account Number"
          required
          value={payout.accountNumber}
          onChange={(e) => onChange("accountNumber", e.target.value)}
        />
        <Field
          label="IFSC Code"
          required
          value={payout.ifsc}
          onChange={(e) => onChange("ifsc", e.target.value.toUpperCase())}
        />
        <div>
          <Label>Preferred Payout Mode</Label>
          <select
            className="input"
            value={payout.payoutMode}
            onChange={(e) => onChange("payoutMode", e.target.value)}
          >
            <option value="NEFT">NEFT</option>
            <option value="IMPS">IMPS</option>
            <option value="RTGS">RTGS</option>
          </select>
        </div>
      </div>

      <Helper>
        For any change in bank details, our team may contact you for additional
        verification.
      </Helper>

      <FooterSaveBar onSave={onSave} />
    </div>
  );
}

/* ===================== Small components ===================== */

function SectionHeader({ title, desc, small = false }) {
  return (
    <div className="space-y-0.5">
      <h2
        className={
          small
            ? "text-xs font-semibold text-slate-900"
            : "text-sm font-semibold text-slate-900"
        }
      >
        {title}
      </h2>
      {desc && (
        <p className="text-[11px] text-slate-500 max-w-2xl">
          {desc}
        </p>
      )}
    </div>
  );
}

function Field({ label, required, helper, className, ...rest }) {
  return (
    <div className={className}>
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <input className="input" {...rest} />
      {helper && <Helper>{helper}</Helper>}
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="text-[11px] font-medium text-slate-700">
      {children}
    </label>
  );
}

function Helper({ children }) {
  return <p className="mt-1 text-[10px] text-slate-500">{children}</p>;
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors",
        checked
          ? "bg-emerald-500 border-emerald-500"
          : "bg-slate-200 border-slate-300",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

function FooterSaveBar({ onSave }) {
  return (
    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[10px] text-slate-500">
        Changes apply only to your agency account. Some settings may still be subject
        to system & airline rules.
      </p>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
      >
        Save Changes
      </button>
    </div>
  );
}

function SettingBlock({ title, children }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/60 p-3 space-y-2">
      <div className="text-xs font-semibold text-slate-800">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <input
        type="checkbox"
        className="h-3 w-3"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
