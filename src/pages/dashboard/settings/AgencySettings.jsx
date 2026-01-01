// src/pages/dashboard/settings/AgencySettings.jsx
import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  Building2,
  CreditCard,
  FileText,
  Landmark,
  RefreshCcw,
  Save,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

/**
 * Enterprise Agency Settings (Theme-vars only ✅)
 * Expected CSS vars:
 * --surface, --surface2, --text, --muted, --border,
 * --primary, --primaryHover, --primarySoft
 */

function cx(...cls) {
  return cls.filter(Boolean).join(" ");
}

const TABS = [
  { key: "profile", label: "Profile & KYC", icon: <Building2 size={16} /> },
  { key: "booking", label: "Booking & Markup", icon: <SlidersHorizontal size={16} /> },
  { key: "invoice", label: "Invoice & GST", icon: <FileText size={16} /> },
  { key: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { key: "payout", label: "Payout & Bank", icon: <Landmark size={16} /> },
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
    footerNote:
      "This is a computer generated document and does not require signature.",
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

  // dirty tracking (enterprise UX)
  const [dirty, setDirty] = useState(false);

  const update = (setter) => (field, value) => {
    setDirty(true);
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const updateProfile = update(setProfile);
  const updateBooking = update(setBooking);
  const updateInvoice = update(setInvoice);
  const updateNotifications = update(setNotifications);
  const updatePayout = update(setPayout);

  // ==== Save handlers (wire to API) ====
  const handleSave = () => {
    // later: per-tab API calls; for now, one save
    console.log("Save payload:", { profile, booking, invoice, notifications, payout });
    setDirty(false);
    alert("Settings saved (demo).");
  };

  const handleResetDemo = () => {
    // reset to initial demo state quickly (optional)
    setDirty(false);
    alert("Demo reset not implemented. Wire your API reset or reload.");
  };

  const meta = useMemo(
    () => ({
      agencyId: "V2A-2217",
      kyc: "Verified",
      iata: profile.iataStatus === "YES" ? "IATA: Yes" : "IATA: No",
    }),
    [profile.iataStatus]
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--surface2)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[260px]">
            <div className="text-[12px] text-[var(--muted)]">
              Settings <span className="opacity-60">/</span> Agency
            </div>
            <h1 className="mt-1 text-xl font-semibold">Agency Settings</h1>
            <p className="mt-1 text-xs text-[var(--muted)] max-w-2xl">
              Configure your agency profile, booking preferences, markup rules, GST
              invoice format, notifications, and payout bank details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill icon={<BadgeCheck size={14} />} text={`KYC: ${meta.kyc}`} />
            <Pill icon={<Settings size={14} />} text={`ID: ${meta.agencyId}`} />
            <Pill icon={<CreditCard size={14} />} text={meta.iata} />

            <button
              type="button"
              onClick={handleResetDemo}
              className={cx(
                "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold",
                "border-[color:var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]"
              )}
              title="Demo reset"
            >
              <RefreshCcw size={16} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={cx(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-white",
                "bg-[var(--primary)] hover:bg-[var(--primaryHover)]"
              )}
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Left tabs */}
          <aside className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
            <div className="border-b border-[color:var(--border)] px-4 py-3">
              <div className="text-sm font-semibold">Sections</div>
              <div className="mt-1 text-[11px] text-[var(--muted)]">
                Manage settings by category.
              </div>
            </div>

            <div className="p-2">
              {TABS.map((t) => {
                const active = t.key === activeTab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={cx(
                      "w-full rounded-lg px-3 py-2 text-left transition",
                      "border border-transparent",
                      active
                        ? "bg-[var(--primarySoft)] border-[color:var(--border)]"
                        : "hover:bg-[var(--surface2)]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="opacity-80">{t.icon}</span>
                      <div>
                        <div className="text-sm font-semibold">{t.label}</div>
                        <div className="text-[11px] text-[var(--muted)]">
                          {tabHint(t.key)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dirty indicator */}
            <div className="border-t border-[color:var(--border)] px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-[var(--muted)]">
                  {dirty ? "Unsaved changes" : "All changes saved"}
                </div>
                <span
                  className={cx(
                    "h-2.5 w-2.5 rounded-full border",
                    dirty
                      ? "bg-[var(--primary)] border-[var(--primary)]"
                      : "bg-[var(--surface2)] border-[color:var(--border)]"
                  )}
                />
              </div>
            </div>
          </aside>

          {/* Right content */}
          <section className="space-y-4">
            {activeTab === "profile" && (
              <Card
                title="Agency Profile & KYC"
                desc="Update agency details. PAN & GST are used for invoicing and compliance."
              >
                <ProfileTab profile={profile} onChange={updateProfile} />
              </Card>
            )}

            {activeTab === "booking" && (
              <Card
                title="Booking & Markup"
                desc="Control search defaults, hold settings and markup rules for fares."
              >
                <BookingTab booking={booking} onChange={updateBooking} />
              </Card>
            )}

            {activeTab === "invoice" && (
              <Card
                title="Invoice & GST"
                desc="Manage GST header, invoice type and footer notes for documents."
              >
                <InvoiceTab invoice={invoice} onChange={updateInvoice} />
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card
                title="Notifications"
                desc="Control alerts and auto reports across email and SMS/WhatsApp."
              >
                <NotificationsTab
                  notifications={notifications}
                  onChange={updateNotifications}
                />
              </Card>
            )}

            {activeTab === "payout" && (
              <Card
                title="Payout & Bank"
                desc="Bank details used for incentives and settlement payouts."
              >
                <PayoutTab payout={payout} onChange={updatePayout} />
              </Card>
            )}

            {/* Bottom save bar (enterprise) */}
            <StickySaveBar dirty={dirty} onSave={handleSave} />
          </section>
        </div>
      </div>
    </div>
  );
}

/* ===================== UI Blocks ===================== */

function Card({ title, desc, children }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
      <div className="border-b border-[color:var(--border)] px-5 py-4">
        <div className="text-sm font-semibold">{title}</div>
        {desc ? <div className="mt-1 text-xs text-[var(--muted)]">{desc}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Pill({ icon, text }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold",
        "border-[color:var(--border)] bg-[var(--surface)]"
      )}
    >
      <span className="opacity-80">{icon}</span>
      <span className="text-[var(--muted)]">{text}</span>
    </span>
  );
}

function StickySaveBar({ dirty, onSave }) {
  return (
    <div className="sticky bottom-3">
      <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] text-[var(--muted)]">
          {dirty
            ? "You have unsaved changes. Save to apply settings to your agency account."
            : "Changes apply only to your agency account. Some settings are subject to system & airline rules."}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty}
          className={cx(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold text-white",
            "bg-[var(--primary)] hover:bg-[var(--primaryHover)]",
            !dirty && "opacity-50 cursor-not-allowed hover:bg-[var(--primary)]"
          )}
        >
          <Save size={16} />
          Save changes
        </button>
      </div>
    </div>
  );
}

/* ===================== Tabs Content ===================== */

function ProfileTab({ profile, onChange }) {
  return (
    <div className="space-y-6">
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

        <SelectField
          label="Business Type"
          required
          value={profile.businessType}
          onChange={(e) => onChange("businessType", e.target.value)}
          options={[
            { value: "PROPRIETOR", label: "Proprietorship" },
            { value: "PARTNERSHIP", label: "Partnership" },
            { value: "PVT_LTD", label: "Private Limited" },
            { value: "LLP", label: "LLP" },
            { value: "OTHER", label: "Other" },
          ]}
        />

        <Field
          label="PAN (read-only after KYC)"
          value={profile.pan}
          readOnly
          className="uppercase"
          helper="For any PAN change, please contact support."
          tone="readOnly"
        />

        <Field
          label="GST Number"
          value={profile.gst}
          onChange={(e) => onChange("gst", e.target.value.toUpperCase())}
          className="uppercase"
          helper="Leave blank if you do not want GST invoices."
        />

        <div>
          <Label>IATA Accredited?</Label>
          <div className="mt-2 flex items-center gap-4 text-[12px]">
            <Radio
              name="iata"
              label="Yes"
              checked={profile.iataStatus === "YES"}
              onChange={() => onChange("iataStatus", "YES")}
            />
            <Radio
              name="iata"
              label="No"
              checked={profile.iataStatus === "NO"}
              onChange={() => onChange("iataStatus", "NO")}
            />
          </div>
        </div>
      </div>

      <Divider />

      <div>
        <SubTitle title="Contact & Address" desc="Used for invoices and communication." />
        <div className="mt-3 grid gap-4 md:grid-cols-2">
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

      <Divider />

      <div>
        <SubTitle title="Brand Logo" desc="Shown on tickets, invoices and vouchers." />
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-24 w-28 rounded-lg border border-dashed border-[color:var(--border)] bg-[var(--surface2)] grid place-items-center text-[11px] text-[var(--muted)]">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt="Agency logo"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span>Logo preview</span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <input
              type="file"
              accept="image/*"
              className="block w-full text-[12px]"
              onChange={(e) =>
                onChange(
                  "logoUrl",
                  e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : ""
                )
              }
            />
            <div className="text-[11px] text-[var(--muted)]">
              Recommended: 400×120 PNG (transparent). Keep file size below your CDN limit.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingTab({ booking, onChange }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField
          label="Default Trip Type"
          value={booking.defaultTrip}
          onChange={(e) => onChange("defaultTrip", e.target.value)}
          options={[
            { value: "ONEWAY", label: "Oneway" },
            { value: "ROUND", label: "Round Trip" },
            { value: "MULTICITY", label: "Multi City" },
          ]}
        />

        <SelectField
          label="Default Sort in Results"
          value={booking.defaultSort}
          onChange={(e) => onChange("defaultSort", e.target.value)}
          options={[
            { value: "CHEAPEST", label: "Cheapest First" },
            { value: "EARLIEST", label: "Earliest Departure" },
            { value: "NONSTOP", label: "Non-stop First" },
          ]}
        />

        <ToggleRow
          title="Show Net Fare by default"
          desc="Display net (B2B) fare first instead of published fare."
          checked={booking.showNetFare}
          onChange={(v) => onChange("showNetFare", v)}
        />
      </div>

      <Divider />

      <div className="space-y-3">
        <SubTitle title="Hold & Ticketing Preferences" desc="Subject to airline and system rules." />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ToggleRow
            title="Allow PNR hold for eligible flights"
            desc='When enabled, you will see "Hold" option wherever airline supports time-limit booking.'
            checked={booking.allowHold}
            onChange={(v) => onChange("allowHold", v)}
            compact
          />

          {booking.allowHold ? (
            <div className="flex items-center gap-2">
              <Label>Default hold time</Label>
              <input
                type="number"
                min={1}
                max={24}
                value={booking.holdTimeHours}
                onChange={(e) => onChange("holdTimeHours", Number(e.target.value || 0))}
                className={cx(
                  "w-24 rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              />
              <span className="text-[11px] text-[var(--muted)]">hours</span>
            </div>
          ) : null}
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <SubTitle title="Flight Markup Rules" desc="Control how markup is applied on B2B fares." />

        <div className="grid gap-4 md:grid-cols-2">
          <Box title="Domestic Flights" badge="India Sector">
            <SelectField
              label="Markup Type"
              value={booking.flightDomesticMarkupType}
              onChange={(e) => onChange("flightDomesticMarkupType", e.target.value)}
              options={[
                { value: "PER_TICKET", label: "Fixed per Ticket (₹)" },
                { value: "PER_PAX", label: "Fixed per Pax (₹)" },
                { value: "PERCENT", label: "% of Base Fare" },
              ]}
            />
            <Field
              label="Markup Value"
              type="number"
              value={booking.flightDomesticMarkupValue}
              onChange={(e) =>
                onChange("flightDomesticMarkupValue", Number(e.target.value || 0))
              }
            />
          </Box>

          <Box title="International Flights" badge="Ex-India & Ex-Intl">
            <SelectField
              label="Markup Type"
              value={booking.flightIntlMarkupType}
              onChange={(e) => onChange("flightIntlMarkupType", e.target.value)}
              options={[
                { value: "PER_TICKET", label: "Fixed per Ticket (₹)" },
                { value: "PER_PAX", label: "Fixed per Pax (₹)" },
                { value: "PERCENT", label: "% of Base Fare" },
              ]}
            />
            <Field
              label="Markup Value"
              type="number"
              value={booking.flightIntlMarkupValue}
              onChange={(e) => onChange("flightIntlMarkupValue", Number(e.target.value || 0))}
            />
          </Box>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Rounding Preference"
            value={booking.roundingMode}
            onChange={(e) => onChange("roundingMode", e.target.value)}
            helper="Applied on final selling fare."
            options={[
              { value: "NONE", label: "No rounding" },
              { value: "ROUND_10", label: "Nearest ₹10" },
              { value: "ROUND_50", label: "Nearest ₹50" },
              { value: "ROUND_100", label: "Nearest ₹100" },
            ]}
          />

          <ToggleRow
            title="Hide markup breakup on print ticket"
            desc="Passenger-facing ticket will not show margin as separate line."
            checked={booking.hideMarkupOnTicket}
            onChange={(v) => onChange("hideMarkupOnTicket", v)}
          />
        </div>
      </div>
    </div>
  );
}

function InvoiceTab({ invoice, onChange }) {
  return (
    <div className="space-y-6">
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
          onChange={(e) => onChange("gstNumber", e.target.value.toUpperCase())}
          className="uppercase"
        />

        <div className="md:col-span-2">
          <Field
            label="GST Registered Address"
            required
            value={invoice.gstAddress}
            onChange={(e) => onChange("gstAddress", e.target.value)}
          />
        </div>

        <SelectField
          label="Default Invoice Type"
          value={invoice.invoiceType}
          onChange={(e) => onChange("invoiceType", e.target.value)}
          options={[
            { value: "B2B", label: "B2B Invoice (Net fare)" },
            { value: "B2C", label: "B2C Invoice (With markup)" },
          ]}
        />

        <ToggleRow
          title="Show service charge separately"
          desc="Displays convenience/service fee as a separate line item."
          checked={invoice.showServiceCharge}
          onChange={(v) => onChange("showServiceCharge", v)}
        />
      </div>

      <Divider />

      <div>
        <SubTitle title="Invoice Footer / Notes" desc="Shown at the bottom of tickets & invoices." />
        <textarea
          className={cx(
            "mt-3 w-full min-h-[110px] rounded-xl border px-3 py-2 text-[12px] outline-none",
            "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
          )}
          value={invoice.footerNote}
          onChange={(e) => onChange("footerNote", e.target.value)}
        />
      </div>
    </div>
  );
}

function NotificationsTab({ notifications, onChange }) {
  return (
    <div className="space-y-6">
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
          <Hint>
            SMS/WhatsApp charges may apply as per plan. Passenger messages can be configured per booking.
          </Hint>
        </SettingBlock>
      </div>

      <Divider />

      <div className="grid gap-4 md:grid-cols-2">
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
          <ToggleRow
            compact
            title="Limit SMS during night"
            desc="SMS alerts will be paused during this window where permitted by regulations."
            checked={notifications.quietHours}
            onChange={(v) => onChange("quietHours", v)}
          />

          {notifications.quietHours ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="text-[var(--muted)]">From</span>
              <input
                type="time"
                value={notifications.quietFrom}
                onChange={(e) => onChange("quietFrom", e.target.value)}
                className={cx(
                  "w-32 rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              />
              <span className="text-[var(--muted)]">to</span>
              <input
                type="time"
                value={notifications.quietTo}
                onChange={(e) => onChange("quietTo", e.target.value)}
                className={cx(
                  "w-32 rounded-lg border px-3 py-2 text-[12px] outline-none",
                  "bg-[var(--surface)] border-[color:var(--border)] focus:border-[color:var(--primary)]"
                )}
              />
            </div>
          ) : null}
        </SettingBlock>
      </div>
    </div>
  );
}

function PayoutTab({ payout, onChange }) {
  return (
    <div className="space-y-6">
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
          className="uppercase"
        />
        <SelectField
          label="Preferred Payout Mode"
          value={payout.payoutMode}
          onChange={(e) => onChange("payoutMode", e.target.value)}
          options={[
            { value: "NEFT", label: "NEFT" },
            { value: "IMPS", label: "IMPS" },
            { value: "RTGS", label: "RTGS" },
          ]}
        />
      </div>

      <Hint>
        For any change in bank details, our team may contact you for additional verification.
      </Hint>
    </div>
  );
}

/* ===================== Small components ===================== */

function tabHint(key) {
  if (key === "profile") return "KYC & business identity";
  if (key === "booking") return "Defaults, hold & markups";
  if (key === "invoice") return "GST header & invoice format";
  if (key === "notifications") return "Email/SMS and reports";
  if (key === "payout") return "Bank accounts & settlement";
  return "";
}

function Divider() {
  return <div className="border-t border-[color:var(--border)]" />;
}

function SubTitle({ title, desc }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      {desc ? <div className="mt-1 text-xs text-[var(--muted)]">{desc}</div> : null}
    </div>
  );
}

function Label({ children }) {
  return <label className="text-[11px] font-semibold text-[var(--muted)]">{children}</label>;
}

function Hint({ children }) {
  return <div className="text-[11px] text-[var(--muted)]">{children}</div>;
}

function Field({ label, required, helper, tone, className, ...rest }) {
  const readOnly = tone === "readOnly" || rest.readOnly;

  return (
    <div className={className}>
      <Label>
        {label} {required ? <span className="text-[var(--text)]">*</span> : null}
      </Label>
      <input
        {...rest}
        className={cx(
          "mt-1 w-full rounded-xl border px-3 py-2 text-[12px] outline-none",
          "border-[color:var(--border)] bg-[var(--surface)] focus:border-[color:var(--primary)]",
          readOnly && "bg-[var(--surface2)] opacity-80 cursor-not-allowed"
        )}
      />
      {helper ? <div className="mt-1 text-[11px] text-[var(--muted)]">{helper}</div> : null}
    </div>
  );
}

function SelectField({ label, required, helper, options, ...rest }) {
  return (
    <div>
      <Label>
        {label} {required ? <span className="text-[var(--text)]">*</span> : null}
      </Label>
      <select
        {...rest}
        className={cx(
          "mt-1 w-full rounded-xl border px-3 py-2 text-[12px] outline-none",
          "border-[color:var(--border)] bg-[var(--surface)] focus:border-[color:var(--primary)]"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {helper ? <div className="mt-1 text-[11px] text-[var(--muted)]">{helper}</div> : null}
    </div>
  );
}

function Radio({ name, label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 text-[12px]">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function ToggleRow({ title, desc, checked, onChange, compact }) {
  return (
    <div className={cx("flex items-start gap-3", compact ? "" : "mt-6 md:mt-0")}>
      <Toggle checked={checked} onChange={onChange} />
      <div>
        <div className="text-[12px] font-semibold">{title}</div>
        {desc ? <div className="text-[11px] text-[var(--muted)]">{desc}</div> : null}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors",
        "border-[color:var(--border)]",
        checked ? "bg-[var(--primary)]" : "bg-[var(--surface2)]"
      )}
      aria-pressed={checked}
    >
      <span
        className={cx(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function SettingBlock({ title, children }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface2)] p-4 space-y-2">
      <div className="text-sm font-semibold">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-[12px]">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function Box({ title, badge, children }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface2)] p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">{title}</div>
        <span className="rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
          {badge}
        </span>
      </div>
      <div className="mt-3 grid gap-3">{children}</div>
    </div>
  );
}
