import { useState } from "react";

export default function AgentRegistration() {
  const [submitting, setSubmitting] = useState(false);

  // ===== ONLY screenshot fields =====
  const [form, setForm] = useState({
    signupAs: "RETAILER",

    companyName: "",
    organisationType: "",
    title: "Mr.",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",

    officeAddress: "",
    state: "",
    city: "",
    pincode: "",
    nearbyAirport: "",
    salesPerson: "",

    panHolderName: "",
    panCardNumber: "",
    panDocument: null,

    addressProofType: "",
    addressProofImage: null,

    // GST Details (screenshot)
    gstRegistration: "",
    gstCompanyName: "",
    gstMobile: "",
    gstEmail: "",
    gstOfficeAddress: "",
    gstImage: null,

    consent: false,
  });

  const handleChange = (field, value) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleFileChange = (field, file) =>
    setForm((p) => ({ ...p, [field]: file || null }));

  const mockUpload = (file, label) => {
    if (!file) return alert(`Choose ${label} file first.`);
    alert(`${label} uploaded (demo): ${file.name}`);
  };

  // Required fields exactly as screenshot starred ones
  const requiredOk =
    form.companyName &&
    form.organisationType &&
    form.title &&
    form.firstName &&
    form.lastName &&
    form.email &&
    form.mobile &&
    form.officeAddress &&
    form.state &&
    form.city &&
    form.pincode &&
    form.nearbyAirport &&
    form.panCardNumber &&
    form.panDocument &&
    form.addressProofType &&
    form.addressProofImage &&
    form.consent;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!requiredOk) {
      alert("Please fill all required (*) fields and upload required documents.");
      return;
    }

    if (String(form.mobile).length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (String(form.pincode).length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      panDocument: form.panDocument?.name || null,
      addressProofImage: form.addressProofImage?.name || null,
      gstImage: form.gstImage?.name || null,
    };

    console.log("Agent SignUp Payload:", payload);

    setTimeout(() => {
      setSubmitting(false);
      alert("Agent SignUp submitted successfully (demo).");
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* =================== TOP CONTENT (AS IT IS) =================== */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr] items-start mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-600 mb-2">
              B2B TRAVEL PARTNER PROGRAM
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">
              Become a <span className="text-sky-600">Registered Travel Agent</span>{" "}
              and start booking Flights & Holidays with{" "}
              <span className="bg-amber-100 px-1 rounded-md">
                instant commissions
              </span>
              .
            </h1>
            <p className="mt-3 text-sm text-slate-600 max-w-2xl">
              Complete the simple KYC form below. We verify your PAN, Aadhaar &
              mobile instantly. Once approved, you&apos;ll get access to our full B2B
              booking portal with wallet, markups, reports and more.
            </p>

            <div className="mt-5 grid sm:grid-cols-3 gap-3 text-xs">
              <FeatureBadge title="Realtime Wallet" desc="Top-up & settle instantly" />
              <FeatureBadge title="Best Airfares" desc="Special B2B deals & markups" />
              <FeatureBadge title="Dedicated Support" desc="Account manager for you" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-sky-200 via-emerald-100 to-amber-100 blur-3xl opacity-60 pointer-events-none" />
            <div className="relative rounded-md border border-slate-200 bg-white shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Account creation steps
              </h2>
              <ol className="space-y-2 text-xs text-slate-600">
                <li>
                  <span className="font-semibold text-slate-800">1.</span> Fill basic
                  agency & contact details.
                </li>
                <li>
                  <span className="font-semibold text-slate-800">2.</span> Verify{" "}
                  <span className="font-semibold">Mobile, PAN & Aadhaar</span>.
                </li>
                <li>
                  <span className="font-semibold text-slate-800">3.</span> Submit bank
                  details for payouts (optional but recommended).
                </li>
                <li>
                  <span className="font-semibold text-slate-800">4.</span> Our team
                  approves your profile & activates login.
                </li>
              </ol>
              <div className="mt-4 p-3 rounded-md bg-sky-50 border border-sky-100 text-[11px] text-sky-900">
                ⏱️ Average approval time:{" "}
                <span className="font-semibold">within 2–4 working hours</span> during
                business days.
              </div>
            </div>
          </div>
        </div>
        {/* =================== /TOP CONTENT =================== */}

        {/* =================== FORM (Screenshot-only) =================== */}
        <form
          onSubmit={handleSubmit}
          className="rounded-md border border-slate-200 bg-white shadow-sm p-4 sm:p-6"
        >
          <div className="mb-3 flex items-center justify-center">
            <h2 className="text-sm font-semibold text-slate-800">Agent SignUp</h2>
          </div>

          {/* Top dropdown */}
          <div className="mb-6">
            <select
              className="input max-w-sm"
              value={form.signupAs}
              onChange={(e) => handleChange("signupAs", e.target.value)}
            >
              <option value="RETAILER">Become a Retailer</option>
              <option value="DISTRIBUTOR">Become a Distributor</option>
              <option value="CORPORATE">Become a Corporate</option>
            </select>
          </div>

          <div className="border-t border-slate-200 pt-6" />

          {/* ===== Main Details Grid (exact screenshot fields) ===== */}
          <div className="grid gap-4 md:grid-cols-4">
            <Field
              label="Company Name"
              required
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />

            <SelectField
              label="Type of organisation"
              required
              value={form.organisationType}
              onChange={(e) => handleChange("organisationType", e.target.value)}
              options={[
                { value: "", label: "-Select-" },
                { value: "PROPRIETOR", label: "Proprietorship" },
                { value: "PARTNERSHIP", label: "Partnership" },
                { value: "PVT_LTD", label: "Private Limited" },
                { value: "LLP", label: "LLP" },
                { value: "OTHER", label: "Other" },
              ]}
            />

            <SelectField
              label="Title"
              required
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              options={[
                { value: "Mr.", label: "Mr." },
                { value: "Ms.", label: "Ms." },
                { value: "Mrs.", label: "Mrs." },
                { value: "Dr.", label: "Dr." },
              ]}
            />

            <Field
              label="First Name"
              required
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />

            <Field
              label="Last Name"
              required
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />

            <Field
              label="Email ID"
              required
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <Field
              label="Mobile Number"
              required
              type="tel"
              maxLength={10}
              value={form.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
            />

            <Field
              label="Office Address"
              required
              value={form.officeAddress}
              onChange={(e) => handleChange("officeAddress", e.target.value)}
            />

            <SelectField
              label="State"
              required
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
              options={[
                { value: "", label: "-Select-" },
                { value: "DELHI", label: "Delhi" },
                { value: "MAHARASHTRA", label: "Maharashtra" },
                { value: "UP", label: "Uttar Pradesh" },
                { value: "RAJASTHAN", label: "Rajasthan" },
                { value: "OTHER", label: "Other" },
              ]}
            />

            <SelectField
              label="City"
              required
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              options={[
                { value: "", label: "-Select-" },
                { value: "NEW_DELHI", label: "New Delhi" },
                { value: "MUMBAI", label: "Mumbai" },
                { value: "LUCKNOW", label: "Lucknow" },
                { value: "JAIPUR", label: "Jaipur" },
                { value: "OTHER", label: "Other" },
              ]}
            />

            <Field
              label="Pincode"
              required
              maxLength={6}
              value={form.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
            />

            <Field
              label="NearBy Airport"
              required
              value={form.nearbyAirport}
              onChange={(e) => handleChange("nearbyAirport", e.target.value)}
            />

            <Field
              label="Sales Person (Optional)"
              value={form.salesPerson}
              onChange={(e) => handleChange("salesPerson", e.target.value)}
            />
          </div>

          <div className="my-8 border-t border-slate-200" />

          {/* ===== PAN + Address Proof Grid ===== */}
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="PAN Holder Name"
              value={form.panHolderName}
              onChange={(e) => handleChange("panHolderName", e.target.value)}
            />

            <Field
              label="PAN Card Number"
              required
              maxLength={10}
              value={form.panCardNumber}
              onChange={(e) =>
                handleChange("panCardNumber", e.target.value.toUpperCase())
              }
            />

            <div>
              <Label>
                Pan Document <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="input-file"
                  onChange={(e) =>
                    handleFileChange("panDocument", e.target.files?.[0] || null)
                  }
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => mockUpload(form.panDocument, "Pan Document")}
                >
                  UPLOAD IMAGE
                </button>
              </div>
            </div>

            <SelectField
              label="Address / Identity Proof"
              required
              value={form.addressProofType}
              onChange={(e) => handleChange("addressProofType", e.target.value)}
              options={[
                { value: "", label: "-Select-" },
                { value: "AADHAAR", label: "Aadhaar Card" },
                { value: "VOTER", label: "Voter ID" },
                { value: "DL", label: "Driving License" },
                { value: "PASSPORT", label: "Passport" },
              ]}
            />

            <div className="md:col-span-2">
              <Label>
                Address / Identity Proof Image <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="input-file"
                  onChange={(e) =>
                    handleFileChange(
                      "addressProofImage",
                      e.target.files?.[0] || null
                    )
                  }
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() =>
                    mockUpload(form.addressProofImage, "Address Proof Image")
                  }
                >
                  UPLOAD IMAGE
                </button>
              </div>
            </div>
          </div>

          {/* ===== GST Details ===== */}
          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-800 mb-3">GST Details</p>

            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="GST Registration"
                value={form.gstRegistration}
                onChange={(e) => handleChange("gstRegistration", e.target.value)}
              />

              <Field
                label="Company Name"
                value={form.gstCompanyName}
                onChange={(e) => handleChange("gstCompanyName", e.target.value)}
              />

              <Field
                label="Mobile Number"
                maxLength={10}
                value={form.gstMobile}
                onChange={(e) => handleChange("gstMobile", e.target.value)}
              />

              <Field
                label="Email ID"
                type="email"
                value={form.gstEmail}
                onChange={(e) => handleChange("gstEmail", e.target.value)}
              />

              <Field
                label="Office Address"
                value={form.gstOfficeAddress}
                onChange={(e) => handleChange("gstOfficeAddress", e.target.value)}
              />

              <div>
                <Label>GST Image</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="input-file"
                    onChange={(e) =>
                      handleFileChange("gstImage", e.target.files?.[0] || null)
                    }
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => mockUpload(form.gstImage, "GST Image")}
                  >
                    UPLOAD IMAGE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Consent line */}
          <div className="mt-6">
            <label className="inline-flex items-start gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                className="mt-0.5 h-3.5 w-3.5"
                checked={form.consent}
                onChange={(e) => handleChange("consent", e.target.checked)}
              />
              <span>
                I authorize Virtual2Actual & its representatives to Call , SMS &
                Email me with reference to my Travel enquiry. This consent will
                override any registration for DNC / NDNC.{" "}
                <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="mt-8 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn-muted"
            >
              BACK
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={[
                "btn-primary px-6",
                !requiredOk ? "opacity-60 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {submitting ? "SUBMITTING..." : "SUBMIT"}
            </button>
          </div>
        </form>
      </div>

      {/* Small local utility styles (if your project already has these, you can remove) */}
      <style>{`
        .input{
          width:100%;
          border:1px solid rgb(226 232 240);
          background:white;
          border-radius:8px;
          padding:10px 12px;
          font-size:12px;
          outline:none;
        }
        .input:focus{
          border-color: rgb(56 189 248);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.15);
        }
        .input-file{
          width:100%;
          border:1px solid rgb(226 232 240);
          background:white;
          border-radius:8px;
          padding:6px 8px;
          font-size:11px;
        }
        .btn-primary{
          background:#0b5ed7;
          color:white;
          border-radius:6px;
          padding:9px 12px;
          font-size:11px;
          font-weight:600;
          white-space:nowrap;
        }
        .btn-primary:hover{ filter:brightness(0.95); }
        .btn-muted{
          background:#64748b;
          color:white;
          border-radius:6px;
          padding:9px 14px;
          font-size:11px;
          font-weight:600;
        }
      `}</style>
    </div>
  );
}

/* ===== Small UI bits ===== */

function FeatureBadge({ title, desc }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white/80 px-3 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <div className="text-[11px] font-semibold text-slate-900">{title}</div>
      <div className="text-[10px] text-slate-500">{desc}</div>
    </div>
  );
}

function Label({ children }) {
  return <label className="text-[11px] font-medium text-slate-700">{children}</label>;
}

function Field({ label, required, className = "", ...rest }) {
  return (
    <div className={className}>
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <input className="input" {...rest} />
    </div>
  );
}

function SelectField({ label, required, options = [], className = "", ...rest }) {
  return (
    <div className={className}>
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <select className="input" {...rest}>
        {options.map((o) => (
          <option key={o.value + o.label} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
