import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Building2, MapPin, FileText, CheckCircle, Upload } from "lucide-react";
import { useCreateSupplierMutation } from "@/store/api/admin/supplierApi";
import logo from "@/assets/images/calidusheader.png";

const steps = [
  { id: "company", label: "Company Info", icon: Building2 },
  { id: "address", label: "Address", icon: MapPin },
  { id: "docs", label: "Documents", icon: FileText },
  { id: "review", label: "Review", icon: CheckCircle },
];

const supplierTypeOptions = [
  { value: "Tier 1", label: "Tier 1" },
  { value: "Tier 2", label: "Tier 2" },
  { value: "OEM", label: "OEM" },
  { value: "Distributor", label: "Distributor" },
];

const countryOptions = [
  "India",
  "United States",
  "United Kingdom",
  "France",
  "Germany",
  "Israel",
  "Sweden",
  "UAE",
];

const currencyOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
  { value: "AED", label: "AED (د.إ)" },
];

const certificationOptions = [
  "ISO 9001:2015",
  "ISO 14001",
  "AS9100D",
  "ITAR Compliant",
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SupplierRegistrationPage = () => {
  const navigate = useNavigate();
  const [createSupplier, { isLoading: isSubmitting }] = useCreateSupplierMutation();

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];
  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / steps.length) * 100),
    [stepIndex]
  );

  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    type: "",
    email: "",
    phone: "",
    currency: "",
    country: "",
    addressLine1: "",
    addressLine2: "",
    cityState: "",
    postalCode: "",
    licenseNumber: "",
    vatNumber: "",
    linkedIn: "",
    certifications: [],
    tradeLicenseFile: null,
    tradeLicenseExpiry: "",
    vatCertificateFile: null,
    vatCertificateExpiry: "",
  });
  const [errors, setErrors] = useState({});
  const [dragOverTarget, setDragOverTarget] = useState(null);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setFileField = (key, file) => {
    if (!file) {
      setField(key, null);
      return;
    }
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrors((prev) => ({ ...prev, [key]: "Max file size is 10MB" }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setField(key, file);
  };

  const Dropzone = ({ id, label, fileKey, testId }) => {
    const file = form[fileKey];
    const isDragOver = dragOverTarget === fileKey;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div
          className={`rounded-sm border p-4 bg-muted/10 transition-colors ${
            errors[fileKey]
              ? "border-red-500/50"
              : isDragOver
                ? "border-primary/60 bg-primary/10"
                : "border-border"
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverTarget(fileKey);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverTarget(fileKey);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverTarget(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverTarget(null);
            const dropped = e.dataTransfer?.files?.[0];
            if (dropped) setFileField(fileKey, dropped);
          }}
        >
          <input
            id={id}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => setFileField(fileKey, e.target.files?.[0] || null)}
            data-testid={testId}
          />
          <label htmlFor={id} className="cursor-pointer block">
            <div className="h-28 rounded-sm bg-muted/30 flex items-center justify-center text-center">
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </div>
            {file?.name && (
              <p className="text-xs text-muted-foreground mt-2 truncate">
                Selected: {file.name}
              </p>
            )}
          </label>
        </div>
        {errors[fileKey] && <p className="text-xs text-red-400">{errors[fileKey]}</p>}
      </div>
    );
  };

  const validate = (stepId) => {
    const nextErrors = {};
    const requireField = (key, message) => {
      if (!String(form[key] || "").trim()) nextErrors[key] = message;
    };

    if (!stepId || stepId === "company") {
      requireField("name", "Company name is required");
      requireField("contactPerson", "Contact person is required");
      requireField("type", "Supplier type is required");
      requireField("email", "Email is required");
      if (String(form.email || "").trim() && !emailRegex.test(String(form.email).trim())) {
        nextErrors.email = "Enter a valid email address";
      }
      requireField("phone", "Phone is required");
      if (String(form.phone || "").trim() && String(form.phone).replace(/\D/g, "").length < 7) {
        nextErrors.phone = "Enter a valid phone number";
      }
      requireField("licenseNumber", "License number is required");
      requireField("currency", "Supplier currency is required");
    }

    if (!stepId || stepId === "address") {
      requireField("country", "Country is required");
      requireField("addressLine1", "Address line 1 is required");
      requireField("addressLine2", "Address line 2 is required");
      requireField("cityState", "City / State is required");
      requireField("postalCode", "Postal code is required");
    }

    if (!stepId || stepId === "docs") {
      if (!form.tradeLicenseFile) nextErrors.tradeLicenseFile = "Trade license is required";
      requireField("tradeLicenseExpiry", "Trade license expiry date is required");
      if (!form.vatCertificateFile) nextErrors.vatCertificateFile = "VAT certificate is required";
      requireField("vatCertificateExpiry", "VAT certificate expiry date is required");
    }

    return nextErrors;
  };

  const goNext = () => setStepIndex((i) => Math.min(steps.length - 1, i + 1));
  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const handleStepClick = (idx) => {
    if (idx <= stepIndex) {
      setStepIndex(idx);
      return;
    }
    // Only allow moving forward if all previous steps are valid
    const companyErrors = validate("company");
    const addressErrors = validate("address");
    const docsErrors = validate("docs");
    const blockingErrors = idx >= 1 ? { ...companyErrors } : {};
    const addressNeeded = idx >= 2;
    const docsNeeded = idx >= 3;
    const combined = {
      ...blockingErrors,
      ...(addressNeeded ? addressErrors : {}),
      ...(docsNeeded ? docsErrors : {}),
    };
    if (Object.keys(combined).length > 0) {
      setErrors(combined);
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    setStepIndex(idx);
  };

  const continueStep = () => {
    const stepErrors = validate(currentStep?.id);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    goNext();
  };

  const submit = async () => {
    const allErrors = validate();
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    const joinDate = new Date().toISOString().slice(0, 10);
    const cityState = String(form.cityState || "").trim();
    const [city, state] = cityState
      .split(/[,/]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .concat(["", ""])
      .slice(0, 2);

    const documents = [
      form.tradeLicenseFile
        ? {
            type: "trade_license",
            fileName: form.tradeLicenseFile.name,
            mimeType: form.tradeLicenseFile.type,
            size: form.tradeLicenseFile.size,
            expiryDate: form.tradeLicenseExpiry,
          }
        : null,
      form.vatCertificateFile
        ? {
            type: "vat_certificate",
            fileName: form.vatCertificateFile.name,
            mimeType: form.vatCertificateFile.type,
            size: form.vatCertificateFile.size,
            expiryDate: form.vatCertificateExpiry,
          }
        : null,
    ].filter(Boolean);

    const payload = {
      name: form.name.trim(),
      type: form.type.trim(),
      country: form.country.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      joinDate,
      status: "pending",
      documentStatus: "active",
      certifications: Array.isArray(form.certifications) ? form.certifications : [],
      documents,
      // extra fields (passthrough)
      contactPerson: form.contactPerson,
      supplierCurrency: form.currency,
      address: {
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city,
        state,
        postalCode: form.postalCode,
        country: form.country,
      },
      licenseNumber: form.licenseNumber,
      vatNumber: form.vatNumber,
      linkedIn: form.linkedIn,
    };

    try {
      await createSupplier(payload).unwrap();
      toast.success("Registration submitted. Your account is pending approval.");
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-background tactical-grid noise-overlay">
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="h-full max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Calidus" className="h-8 w-28" />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/signup")}>Register</Button>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold font-['Barlow_Condensed'] uppercase tracking-tight">
              Become a verified{" "}
              <span className="text-primary">Defense Supplier</span>
            </h1>
            <p className="text-muted-foreground mt-4">
              Join our network of trusted suppliers and connect with defense buyers worldwide.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-3">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const active = idx === stepIndex;
              const done = idx < stepIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStepClick(idx)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-sm border transition-colors ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-black/10 hover:bg-muted/30"
                  }`}
                  disabled={isSubmitting}
                >
                  <div
                    className={`h-8 w-8 rounded-sm flex items-center justify-center ${
                      done ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Step {idx + 1}
                    </p>
                    <p className="text-sm font-semibold truncate">{s.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <Progress value={progress} />
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-md border-border rounded-sm">
            <CardHeader>
              <CardTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
                {currentStep.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep.id === "company" && (
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-bold font-['Barlow_Condensed'] uppercase tracking-wide">
                      Supplier Information
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Company Name *
                      </Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        className={`bg-black/20 mt-1 ${errors.name ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                        placeholder="Enter your company name"
                        data-testid="supplier-reg-company-name"
                      />
                      {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Contact Person *
                      </Label>
                      <Input
                        value={form.contactPerson}
                        onChange={(e) => setField("contactPerson", e.target.value)}
                        className={`bg-black/20 mt-1 ${errors.contactPerson ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                        placeholder="Full name"
                        data-testid="supplier-reg-contact-person"
                      />
                      {errors.contactPerson && (
                        <p className="text-xs text-red-400 mt-1">{errors.contactPerson}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Supplier Type *
                    </Label>
                    <Select value={form.type} onValueChange={(v) => setField("type", v)}>
                      <SelectTrigger
                        className={`bg-black/20 mt-1 ${errors.type ? "border-red-500/50" : ""}`}
                        data-testid="supplier-reg-type"
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                        <SelectContent>
                          {supplierTypeOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Email *
                        </Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => setField("email", e.target.value)}
                          className={`bg-black/20 mt-1 ${errors.email ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                          placeholder="email@company.com"
                          data-testid="supplier-reg-email"
                        />
                        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Phone *
                        </Label>
                        <Input
                          value={form.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          className={`bg-black/20 mt-1 ${errors.phone ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                          placeholder="+1 000 000 0000"
                          data-testid="supplier-reg-phone"
                        />
                        {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        License Number *
                      </Label>
                      <Input
                        value={form.licenseNumber}
                        onChange={(e) => setField("licenseNumber", e.target.value)}
                        className={`bg-black/20 mt-1 ${errors.licenseNumber ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                        placeholder="Enter license number"
                        data-testid="supplier-reg-license"
                      />
                      {errors.licenseNumber && (
                        <p className="text-xs text-red-400 mt-1">{errors.licenseNumber}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        VAT Number
                      </Label>
                      <Input
                        value={form.vatNumber}
                        onChange={(e) => setField("vatNumber", e.target.value)}
                        className="bg-black/20 mt-1"
                        placeholder="Enter VAT number"
                        data-testid="supplier-reg-vat"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        LinkedIn Profile (Optional)
                      </Label>
                      <Input
                        value={form.linkedIn}
                        onChange={(e) => setField("linkedIn", e.target.value)}
                        className="bg-black/20 mt-1"
                        placeholder="linked..."
                        data-testid="supplier-reg-linkedin"
                      />
                    </div>

                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Supplier Currency *
                      </Label>
                      <Select value={form.currency} onValueChange={(v) => setField("currency", v)}>
                        <SelectTrigger
                          className={`bg-black/20 mt-1 ${errors.currency ? "border-red-500/50" : ""}`}
                          data-testid="supplier-reg-currency"
                        >
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencyOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.currency && <p className="text-xs text-red-400 mt-1">{errors.currency}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep.id === "address" && (
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-bold font-['Barlow_Condensed'] uppercase tracking-wide">
                      Supplier Address
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Address Line 1
                      </Label>
                      <Input
                        value={form.addressLine1}
                        onChange={(e) => setField("addressLine1", e.target.value)}
                        className={`bg-black/20 mt-1 ${errors.addressLine1 ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                        placeholder="Street address"
                        data-testid="supplier-reg-address-1"
                      />
                      {errors.addressLine1 && (
                        <p className="text-xs text-red-400 mt-1">{errors.addressLine1}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Address Line 2
                      </Label>
                      <Input
                        value={form.addressLine2}
                        onChange={(e) => setField("addressLine2", e.target.value)}
                        className={`bg-black/20 mt-1 ${errors.addressLine2 ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                        placeholder="Suite / Building"
                        data-testid="supplier-reg-address-2"
                      />
                      {errors.addressLine2 && (
                        <p className="text-xs text-red-400 mt-1">{errors.addressLine2}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        ZIP / Postal Code
                      </Label>
                      <Input
                        value={form.postalCode}
                        onChange={(e) => setField("postalCode", e.target.value)}
                        className={`bg-black/20 mt-1 ${errors.postalCode ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                        data-testid="supplier-reg-postal"
                      />
                      {errors.postalCode && (
                        <p className="text-xs text-red-400 mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        City / State
                      </Label>
                      <Input
                        value={form.cityState}
                        onChange={(e) => setField("cityState", e.target.value)}
                        className={`bg-black/20 mt-1 ${errors.cityState ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                        data-testid="supplier-reg-city-state"
                      />
                      {errors.cityState && (
                        <p className="text-xs text-red-400 mt-1">{errors.cityState}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Country
                    </Label>
                    <Select value={form.country} onValueChange={(v) => setField("country", v)}>
                      <SelectTrigger
                        className={`bg-black/20 mt-1 ${errors.country ? "border-red-500/50" : ""}`}
                        data-testid="supplier-reg-country"
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country}</p>}
                  </div>
                </div>
              )}

              {currentStep.id === "docs" && (
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-bold font-['Barlow_Condensed'] uppercase tracking-wide">
                      Document Upload
                    </p>
                  </div>

                  <Dropzone
                    id="trade-license-file"
                    label="Trade License"
                    fileKey="tradeLicenseFile"
                    testId="supplier-reg-trade-license"
                  />
                  <div>
                    <Label className="text-sm font-medium">Expiry Date</Label>
                    <Input
                      type="date"
                      value={form.tradeLicenseExpiry}
                      onChange={(e) => setField("tradeLicenseExpiry", e.target.value)}
                      className={`bg-muted/20 mt-1 ${errors.tradeLicenseExpiry ? "border-red-500/50" : ""}`}
                      data-testid="supplier-reg-trade-expiry"
                    />
                    {errors.tradeLicenseExpiry && (
                      <p className="text-xs text-red-400 mt-1">{errors.tradeLicenseExpiry}</p>
                    )}
                  </div>

                  <Dropzone
                    id="vat-certificate-file"
                    label="VAT Certificate"
                    fileKey="vatCertificateFile"
                    testId="supplier-reg-vat-certificate"
                  />
                  <div>
                    <Label className="text-sm font-medium">Expiry Date</Label>
                    <Input
                      type="date"
                      value={form.vatCertificateExpiry}
                      onChange={(e) => setField("vatCertificateExpiry", e.target.value)}
                      className={`bg-muted/20 mt-1 ${errors.vatCertificateExpiry ? "border-red-500/50" : ""}`}
                      data-testid="supplier-reg-vat-expiry"
                    />
                    {errors.vatCertificateExpiry && (
                      <p className="text-xs text-red-400 mt-1">{errors.vatCertificateExpiry}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Select Your Certifications</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {certificationOptions.map((c) => {
                        const selected =
                          Array.isArray(form.certifications) &&
                          form.certifications.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            className={`h-8 px-3 rounded-sm text-xs border transition-colors ${
                              selected
                                ? "bg-foreground text-background border-foreground"
                                : "bg-muted/20 text-muted-foreground border-border hover:bg-muted/30"
                            }`}
                            onClick={() => {
                              const prev = Array.isArray(form.certifications)
                                ? form.certifications
                                : [];
                              const next = selected
                                ? prev.filter((x) => x !== c)
                                : [...prev, c];
                              setField("certifications", next);
                            }}
                            data-testid={`supplier-reg-cert-${c.replace(/\s+/g, "-").toLowerCase()}`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {currentStep.id === "review" && (
                <div className="space-y-6">
                  <div>
                    <p className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide">
                      Review &amp; Submit
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-sm bg-muted/15 border border-border p-5">
                      <p className="text-base font-semibold">Company Information</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Company Name</p>
                          <p className="font-medium mt-1">{form.name || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Supplier Type</p>
                          <p className="font-medium mt-1">{form.type || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Contact Person</p>
                          <p className="font-medium mt-1">{form.contactPerson || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Company Email</p>
                          <p className="font-medium mt-1 break-all">{form.email || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium mt-1">{form.phone || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Currency</p>
                          <p className="font-medium mt-1">{form.currency || "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-sm bg-muted/15 border border-border p-5">
                      <p className="text-base font-semibold">Address</p>
                      <div className="space-y-4 mt-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Address lane</p>
                          <p className="font-medium mt-1">
                            {[form.addressLine1, form.addressLine2]
                              .map((v) => String(v || "").trim())
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">State/Country</p>
                          <p className="font-medium mt-1">
                            {[form.cityState, form.country]
                              .map((v) => String(v || "").trim())
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pincode</p>
                          <p className="font-medium mt-1">{form.postalCode || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-sm bg-muted/15 border border-border p-5">
                    <p className="text-base font-semibold">Certifications</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {[form.tradeLicenseFile, form.vatCertificateFile]
                        .filter(Boolean)
                        .map((file) => (
                          <div
                            key={file.name}
                            className="flex items-center gap-3 rounded-sm bg-background/60 border border-border px-3 py-2"
                          >
                            <div className="h-9 w-9 rounded-sm bg-muted flex items-center justify-center">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-[240px]">
                                {file.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                        ))}
                      {(!form.tradeLicenseFile && !form.vatCertificateFile) && (
                        <p className="text-sm text-muted-foreground">No documents uploaded</p>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground">Selected Certifications</p>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {Array.isArray(form.certifications) && form.certifications.length
                          ? form.certifications.join(", ")
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={goBack} disabled={stepIndex === 0 || isSubmitting}>
                  Back
                </Button>

                {stepIndex < steps.length - 1 ? (
                  <Button onClick={continueStep} disabled={isSubmitting}>
                    Continue
                  </Button>
                ) : (
                  <Button onClick={submit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
