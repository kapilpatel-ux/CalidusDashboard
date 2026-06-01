import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Building2, MapPin, FileText, CheckCircle, Upload, ImagePlus, X } from "lucide-react";
import { State, City } from "country-state-city";
import postalCodes from "postal-codes-js";
import { useCreateSupplierMutation } from "@/store/api/admin/supplierApi";
import logo from "@/assets/images/calidusheader.png";
import { copyCredentialsText, downloadCredentialsJson } from "@/lib/credentialDownload";
import { getCountryCodeFromDialCode, getCountryNameFromDialCode, validatePhoneNumber } from "@/lib/phoneValidation";

const steps = [
  { id: "company", label: "Company Info", icon: Building2 },
  { id: "address", label: "Address", icon: MapPin },
  { id: "docs", label: "Documents", icon: FileText },
  { id: "review", label: "Review", icon: CheckCircle },
];

const fallbackCurrencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
  { value: "AED", label: "AED" },
];

const certificationOptions = [
  "ISO 9001:2015",
  "ISO 14001",
  "AS9100D",
  "others"
];

const businessTypeOptions = ["Manufacturer", "Distributor", "Service Provider"];

const calidusClusterOptions = [
  "Aerospace Cluster",
  "Land Systems",
  "Missiles & Defense Systems",
];

const productAndServicesOptions = [
  "ADAPTORS AND CONNECTORS",
  "AIR DATA MANAGEMENT SYSTEM",
  "AIRFRAME AND STRUCTURE PARTS",
  "ARMAMENT SYSTEM",
  "AVIONICS SYSTEM",
  "CANOPY AND ESCAPE SYSTEM",
  "CATERING / PASTRIES",
  "COCKPIT DISPLAY SYSTEM",
  "COMMUNICATION NAVIGATION IDENTITIFICATION (CNI)",
  "COMPUTER SOFTWARE LICENSES",
  "CONSUMABLES",
  "ELECTRICAL HARDWARES",
  "ELECTRICAL SYSTEM",
  "ENGINEERING SERVICES",
  "ENVIRONMENTAL CONTROL SYSTEM & BLEED SYSTEM",
  "FACILITIES SERVICES",
  "FASTENERS",
  "FLIGHT CONTROL SYSTEM",
  "FUEL SYSTEM",
  "GROUND SUPPORT EQUIPMENT",
  "HARNESSES",
  "HYDRAULIC SYSTEM",
  "LANDING GEAR SYSTEM",
  "LOGISTICS SERVICES",
  "LIGHT SYSTEM",
  "MECANICAL HARDWARES",
  "METALLIC PARTS",
  "MISSION SYSTEM",
  "OFFICE SUPPLIES",
  "OTHERS",
  "PANEL SYSTEM",
  "POWERPLANT SYSTEM",
  "QUALITY SERVICES",
  "RAW MATERIAL",
  "STORAGE",
  "TECHNICAL SERVICES",
  "TOOLS",
];

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const phoneDigits = (value) => String(value || "").replace(/\D/g, "");
	const phoneNationalDigits = (value) => String(value || "").replace(/[^\d]/g, "");
	const normalizeRefId = (value, maxLen) =>
	  String(value || "")
	    .toUpperCase()
	    .replace(/[^A-Z0-9/-]/g, "")
	    .slice(0, maxLen);
	const normalizeVatNumberInput = (value) =>
	  String(value || "")
	    .toUpperCase()
	    .replace(/[^A-Z0-9-]/g, "")
	    .slice(0, VAT_NUMBER_MAX_LEN);
	const PHONE_MIN_DIGITS = 7;
	const PHONE_MAX_DIGITS = 15;
	const PHONE_NATIONAL_MIN_DIGITS = 7;
	const PHONE_NATIONAL_MAX_DIGITS = 12;
	const LICENSE_NUMBER_MIN_LEN = 5;
	const VAT_NUMBER_MIN_LEN = 5;
	const LICENSE_NUMBER_MAX_LEN = 30;
	const VAT_NUMBER_MAX_LEN = 20;
	const BUSINESS_DESCRIPTION_MAX_LEN = 700;
	const MANUFACTURING_DESCRIPTION_MAX_LEN = 300;
	const SUPPLIER_IMAGE_MAX_MB = 5;

const ChipInputField = ({ label, required = false, values = [], onChange, placeholder, error, testId }) => {
  const [draft, setDraft] = useState("");
  const fieldId = `${testId}-input`;

  const addChip = () => {
    const value = draft.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
    setDraft("");
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addChip();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}{required ? " *" : ""}
      </Label>
      <Input
        id={fieldId}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addChip}
        placeholder={placeholder}
        className={`bg-black/20 mt-1 ${error ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
        data-testid={testId}
      />
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="inline-flex max-w-full items-center gap-2 rounded-sm border border-border bg-black/20 px-3 py-1 text-sm">
              <span className="break-all">{value}</span>
              <button
                type="button"
                className="shrink-0 text-muted-foreground hover:text-red-400"
                onClick={() => onChange(values.filter((item) => item !== value))}
                aria-label={`Remove ${value}`}
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

const vatCountryByCallingCode = {
  "+971": "AE",
  "+966": "SA",
  "+974": "QA",
  "+965": "KW",
  "+973": "BH",
  "+968": "OM",
  "+91": "IN",
  "+92": "PK",
  "+1": "US",
  "+44": "GB",
  "+49": "DE",
  "+33": "FR",
};

const vatValidationRules = {
  AE: {
    label: "UAE VAT/TRN",
    pattern: /^\d{15}$/,
    message: "UAE VAT/TRN must be exactly 15 digits",
  },
  IN: {
    label: "India GSTIN",
    pattern: /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    message: "India GSTIN must be 15 characters, e.g. 27ABCDE1234F1Z5",
  },
  GB: {
    label: "UK VAT",
    pattern: /^(GB)?(\d{9}|\d{12})$/,
    message: "UK VAT must be 9 or 12 digits, optionally prefixed with GB",
  },
};

const getVatCountryCode = (countryCode, phoneCountryCode) =>
  countryCode || vatCountryByCallingCode[String(phoneCountryCode || "").trim()] || "";

const validateLicenseNumber = (value) => {
  const license = String(value || "").trim().toUpperCase();
  if (!license) return "License number is required";
  if (license.length < LICENSE_NUMBER_MIN_LEN) return `License number must be at least ${LICENSE_NUMBER_MIN_LEN} characters`;
  if (license.length > LICENSE_NUMBER_MAX_LEN) return `License number must be at most ${LICENSE_NUMBER_MAX_LEN} characters`;
  if (!/^[A-Z0-9/-]+$/.test(license)) return "License number can contain only letters, numbers, slash, and hyphen";
  return "";
};

const validateVatNumber = (value, countryCode, phoneCountryCode) => {
  const vat = String(value || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!vat) return "VAT / Tax number is required";
  if (vat.length < VAT_NUMBER_MIN_LEN) return `VAT / Tax number must be at least ${VAT_NUMBER_MIN_LEN} characters`;
  if (vat.length > VAT_NUMBER_MAX_LEN) return `VAT / Tax number must be at most ${VAT_NUMBER_MAX_LEN} characters`;
  if (!/^[A-Z0-9-]+$/.test(vat)) return "VAT / Tax number can contain only letters, numbers, and hyphen";

  const resolvedCountryCode = getVatCountryCode(countryCode, phoneCountryCode);
  const rule = vatValidationRules[resolvedCountryCode];
  if (rule && !rule.pattern.test(vat)) return rule.message;

  return "";
};

const ManufacturingSectionsField = ({
  sections,
  maxDescriptionLen,
  maxImageMb,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
  onSetSectionImage,
  getSectionError,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-4">
      <p className="text-lg font-bold font-['Barlow_Condensed'] uppercase tracking-wide">
        Manufacturing Capabilities
      </p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onAddSection}
        className="h-8"
        data-testid="supplier-reg-manufacturing-add-section"
      >
        Add Section
      </Button>
    </div>

    {sections.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        Optional: add one or more manufacturing capability sections (title, description, image).
      </p>
    ) : (
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div
            key={section?.id || `manufacturing-section-${index}`}
            className="space-y-3 rounded-sm border border-border bg-black/10 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold">Section {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveSection(index)}
                className="h-8 w-8"
                aria-label={`Remove manufacturing section ${index + 1}`}
                data-testid={`supplier-reg-manufacturing-remove-${index}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Title *
              </Label>
              <Input
                value={section?.title || ""}
                onChange={(e) => onUpdateSection(index, { title: e.target.value })}
                className={`bg-black/20 mt-1 ${
                  getSectionError(index, "title")
                    ? "border-red-500/50 focus-visible:ring-red-500/30"
                    : ""
                }`}
                placeholder="e.g. CNC Machining"
                data-testid={`supplier-reg-manufacturing-title-${index}`}
              />
              {getSectionError(index, "title") && (
                <p className="text-xs text-red-400 mt-1">
                  {getSectionError(index, "title")}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Description *
                </Label>
                <span className="text-xs text-muted-foreground">
                  {String(section?.description || "").length}/{maxDescriptionLen}
                </span>
              </div>
              <Textarea
                value={section?.description || ""}
                onChange={(e) =>
                  onUpdateSection(index, {
                    description: e.target.value.slice(0, maxDescriptionLen),
                  })
                }
                className={`bg-black/20 mt-1 min-h-28 ${
                  getSectionError(index, "description")
                    ? "border-red-500/50 focus-visible:ring-red-500/30"
                    : ""
                }`}
                placeholder="Describe this manufacturing capability section"
                maxLength={maxDescriptionLen}
                data-testid={`supplier-reg-manufacturing-description-${index}`}
              />
              {getSectionError(index, "description") && (
                <p className="text-xs text-red-400 mt-1">
                  {getSectionError(index, "description")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Upload Image *
              </Label>
              <div
                className={`grid gap-4 rounded-sm border bg-black/20 p-3 md:grid-cols-[160px_1fr] ${
                  getSectionError(index, "image")
                    ? "border-red-500/50"
                    : "border-border"
                }`}
              >
                <div className="h-32 overflow-hidden rounded-sm border border-border bg-muted/20">
                  {section?.image ? (
                    <img
                      src={section.image}
                      alt={`Manufacturing section ${index + 1} preview`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      onSetSectionImage(index, event.target.files?.[0] || null)
                    }
                    className="bg-black/20 file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-semibold file:text-primary-foreground"
                    data-testid={`supplier-reg-manufacturing-image-${index}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload manufacturing or capability related image. JPG, PNG, WEBP up to {maxImageMb}MB.
                  </p>
                  {section?.imageFile?.name && (
                    <p className="text-xs text-muted-foreground truncate">
                      Selected: {section.imageFile.name}
                    </p>
                  )}
                </div>
              </div>
              {getSectionError(index, "image") && (
                <p className="text-xs text-red-400">
                  {getSectionError(index, "image")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const callingCodeOptions = [
  { label: "UAE (+971)", value: "+971" },
  { label: "Saudi Arabia (+966)", value: "+966" },
  { label: "Qatar (+974)", value: "+974" },
  { label: "Kuwait (+965)", value: "+965" },
  { label: "Bahrain (+973)", value: "+973" },
  { label: "Oman (+968)", value: "+968" },
  { label: "India (+91)", value: "+91" },
  { label: "Pakistan (+92)", value: "+92" },
  { label: "United States (+1)", value: "+1" },
  { label: "United Kingdom (+44)", value: "+44" },
  { label: "Canada (+1)", value: "+1" },
  { label: "Germany (+49)", value: "+49" },
  { label: "France (+33)", value: "+33" },
];

const DEFAULT_PHONE_COUNTRY_CODE = "+971";
const getCountryFromPhoneCode = (phoneCountryCode) => ({
  country: getCountryNameFromDialCode(phoneCountryCode),
  countryCode: getCountryCodeFromDialCode(phoneCountryCode),
});

const pad2 = (n) => String(n).padStart(2, "0");
const localIsoDate = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const SupplierRegistrationPage = () => {
  const navigate = useNavigate();
  const [createSupplier, { isLoading: isSubmitting }] = useCreateSupplierMutation();
  const [credentialDialog, setCredentialDialog] = useState({ open: false, credentials: null });
  const todayIso = localIsoDate(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowIso = localIsoDate(tomorrowDate);

  const currencyOptions = useMemo(() => {
    try {
      const supported = Intl?.supportedValuesOf?.("currency");
      if (!Array.isArray(supported) || supported.length === 0) return fallbackCurrencyOptions;

      const displayNames = typeof Intl?.DisplayNames === "function"
        ? new Intl.DisplayNames(["en"], { type: "currency" })
        : null;

      return supported
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .map((code) => ({
          value: code,
          label: displayNames ? `${code} - ${displayNames.of(code)}` : code,
        }));
    } catch (_) {
      return fallbackCurrencyOptions;
    }
  }, []);

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];
  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / steps.length) * 100),
    [stepIndex]
  );

  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    businessType: "",
    calidusCluster: "",
    productAndServices: [],
    businessDescription: "",
    email: "",
    phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
    phoneNumber: "",
    currency: "",
    ...getCountryFromPhoneCode(DEFAULT_PHONE_COUNTRY_CODE),
    state: "",
    stateCode: "",
    addressLine1: "",
    addressLine2: "",
    cityState: "",
    postalCode: "",
    licenseNumber: "",
    vatNumber: "",
    linkedIn: "",
    supplierImage: "",
    supplierImageFile: null,
    capabilities: [],
    complianceRegistration: [],
    manufacturingCapabilities: [],
    manufacturingDescription: "",
    manufacturingImage: "",
    manufacturingImageFile: null,
    manufacturingCapabilitySections: [],
    certifications: [],
    otherCertifications: "",
    tradeLicenseFile: null,
    tradeLicenseExpiry: "",
    vatCertificateFile: null,
    vatCertificateExpiry: "",
  });
  const [errors, setErrors] = useState({});
  const [dragOverTarget, setDragOverTarget] = useState(null);

  const [showCustomBusinessType, setShowCustomBusinessType] = useState(false);
  const [customBusinessType, setCustomBusinessType] = useState("");

  const [showCustomCalidusCluster, setShowCustomCalidusCluster] = useState(false);
  const [customCalidusCluster, setCustomCalidusCluster] = useState("");

  const [showCustomProductAndServices, setShowCustomProductAndServices] = useState(false);
  const [customProductAndServices, setCustomProductAndServices] = useState("");

  const [showProductServicesDropdown, setShowProductServicesDropdown] = useState(false);

  const [customProductAndServicesOptions, setCustomProductAndServicesOptions] = useState([]);

  const productServicesDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        productServicesDropdownRef.current &&
        !productServicesDropdownRef.current.contains(event.target)
      ) {
        setShowProductServicesDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const allProductAndServicesOptions = useMemo(() => {
    return [...customProductAndServicesOptions, ...productAndServicesOptions];
  }, [customProductAndServicesOptions]);

  const stateOptions = useMemo(
    () => form.countryCode ? State.getStatesOfCountry(form.countryCode) : [],
    [form.countryCode]
  );
  const cityOptions = useMemo(
    () => {
      if (!form.countryCode || !form.stateCode) return [];
      const seen = new Set();
      return City.getCitiesOfState(form.countryCode, form.stateCode).filter((city) => {
        const key = String(city.name || "").toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    [form.countryCode, form.stateCode]
  );

  const setField = (key, value) => {
    console.log("FIELD UPDATE =>", key, value);
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "country") {
        next.countryCode = "";
        next.state = "";
        next.stateCode = "";
        next.cityState = "";
        next.postalCode = "";
      }
      if (key === "state") {
        next.stateCode = "";
        next.cityState = "";
        next.postalCode = "";
      }
      if (key === "cityState") {
        next.postalCode = "";
      }
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      if (key === "country") {
        delete next.state;
        delete next.cityState;
        delete next.postalCode;
      }
      if (key === "state") {
        delete next.cityState;
        delete next.postalCode;
      }
      if (key === "cityState") {
        delete next.postalCode;
      }
      return next;
    });
  };

  const setPhoneCountryCode = (phoneCountryCode) => {
    const derivedCountry = getCountryFromPhoneCode(phoneCountryCode);
    setForm((prev) => {
      const countryChanged = prev.countryCode !== derivedCountry.countryCode;
      return {
        ...prev,
        phoneCountryCode,
        ...derivedCountry,
        ...(countryChanged
          ? {
              state: "",
              stateCode: "",
              cityState: "",
              postalCode: "",
            }
          : {}),
      };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.phoneCountryCode;
      delete next.country;
      delete next.state;
      delete next.cityState;
      delete next.postalCode;
      return next;
    });
  };

  const setAddressState = (stateCode) => {
    const state = stateOptions.find((option) => option.isoCode === stateCode);
    setForm((prev) => ({
      ...prev,
      state: state?.name || "",
      stateCode: state?.isoCode || "",
      cityState: "",
      postalCode: "",
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.state;
      delete next.cityState;
      delete next.postalCode;
      return next;
    });
  };

  const setFileField = (key, file, maxSizeMb = 10) => {
    if (!file) {
      setField(key, null);
      return;
    }
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrors((prev) => ({ ...prev, [key]: `Max file size is ${maxSizeMb}MB` }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setField(key, file);
  };

  const setSupplierImageFile = (file) => {
    if (!file) {
      setForm((prev) => ({ ...prev, supplierImage: "", supplierImageFile: null }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, supplierImage: "Please select a valid image file" }));
      return;
    }

    if (file.size > SUPPLIER_IMAGE_MAX_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, supplierImage: `Image must be ${SUPPLIER_IMAGE_MAX_MB}MB or smaller` }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        supplierImage: String(reader.result || ""),
        supplierImageFile: file,
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.supplierImage;
        return next;
      });
    };
    reader.onerror = () => {
      setErrors((prev) => ({ ...prev, supplierImage: "Unable to read selected image" }));
    };
    reader.readAsDataURL(file);
  };

  const getManufacturingSectionError = (index, field) =>
    errors[`manufacturingCapabilitySections.${index}.${field}`];

  const updateManufacturingSection = (index, patch) => {
    setForm((prev) => {
      const sections = Array.isArray(prev.manufacturingCapabilitySections)
        ? prev.manufacturingCapabilitySections
        : [];
      const next = sections.map((section, idx) =>
        idx === index ? { ...section, ...patch } : section
      );
      return { ...prev, manufacturingCapabilitySections: next };
    });
    const patchKeys = Object.keys(patch || {});
    if (patchKeys.length) {
      setErrors((prev) => {
        let changed = false;
        const next = { ...prev };
        patchKeys.forEach((key) => {
          const errorKey = `manufacturingCapabilitySections.${index}.${key}`;
          if (Object.prototype.hasOwnProperty.call(next, errorKey)) {
            delete next[errorKey];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  };

  const addManufacturingSection = () => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `mcs_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setForm((prev) => {
      const sections = Array.isArray(prev.manufacturingCapabilitySections)
        ? prev.manufacturingCapabilitySections
        : [];
      return {
        ...prev,
        manufacturingCapabilitySections: [
          ...sections,
          { id, title: "", description: "", image: "", imageFile: null },
        ],
      };
    });
  };

  const removeManufacturingSection = (index) => {
    setForm((prev) => {
      const sections = Array.isArray(prev.manufacturingCapabilitySections)
        ? prev.manufacturingCapabilitySections
        : [];
      const nextSections = sections.filter((_, idx) => idx !== index);
      return { ...prev, manufacturingCapabilitySections: nextSections };
    });
    setErrors((prev) => {
      const next = { ...prev };
      const keys = Object.keys(next);
      keys.forEach((key) => {
        if (!key.startsWith("manufacturingCapabilitySections.")) return;
        const match = key.match(/^manufacturingCapabilitySections\.(\d+)\.(.+)$/);
        if (!match) return;
        const keyIndex = Number(match[1]);
        const field = match[2];
        if (Number.isNaN(keyIndex)) return;
        if (keyIndex === index) {
          delete next[key];
        } else if (keyIndex > index) {
          delete next[key];
          next[`manufacturingCapabilitySections.${keyIndex - 1}.${field}`] = prev[key];
        }
      });
      return next;
    });
  };

  const setManufacturingSectionImage = (index, file) => {
    if (!file) {
      updateManufacturingSection(index, { image: "", imageFile: null });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        [`manufacturingCapabilitySections.${index}.image`]: "Please select a valid image file",
      }));
      return;
    }

    if (file.size > SUPPLIER_IMAGE_MAX_MB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [`manufacturingCapabilitySections.${index}.image`]: `Image must be ${SUPPLIER_IMAGE_MAX_MB}MB or smaller`,
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateManufacturingSection(index, {
        image: String(reader.result || ""),
        imageFile: file,
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`manufacturingCapabilitySections.${index}.image`];
        return next;
      });
    };
    reader.onerror = () => {
      setErrors((prev) => ({
        ...prev,
        [`manufacturingCapabilitySections.${index}.image`]: "Unable to read selected image",
      }));
    };
    reader.readAsDataURL(file);
  };

  const SupplierImageField = () => (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        Supplier Image *
      </Label>
      <div
        className={`grid gap-4 rounded-sm border bg-black/20 p-3 md:grid-cols-[160px_1fr] ${
          errors.supplierImage ? "border-red-500/50" : "border-border"
        }`}
      >
        <div className="h-32 overflow-hidden rounded-sm border border-border bg-muted/20">
          {form.supplierImage ? (
            <img src={form.supplierImage} alt="Supplier preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-3">
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => setSupplierImageFile(event.target.files?.[0] || null)}
            className="bg-black/20 file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-semibold file:text-primary-foreground"
            data-testid="supplier-reg-image"
          />
          <p className="text-xs text-muted-foreground">
            Upload company logo or supplier image. JPG, PNG, WEBP up to {SUPPLIER_IMAGE_MAX_MB}MB.
          </p>
          {form.supplierImageFile?.name && (
            <p className="text-xs text-muted-foreground truncate">Selected: {form.supplierImageFile.name}</p>
          )}
        </div>
      </div>
      {errors.supplierImage && <p className="text-xs text-red-400">{errors.supplierImage}</p>}
    </div>
  );

  const manufacturingSections = Array.isArray(form.manufacturingCapabilitySections)
    ? form.manufacturingCapabilitySections
    : [];

  const Dropzone = ({
    id,
    label,
    fileKey,
    testId,
    accept = ".pdf,.png,.jpg,.jpeg",
    helper = "PDF, PNG, JPG up to 10MB",
    maxSizeMb = 10,
  }) => {
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
            if (dropped) setFileField(fileKey, dropped, maxSizeMb);
          }}
        >
          <input
            id={id}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => setFileField(fileKey, e.target.files?.[0] || null, maxSizeMb)}
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
                  {helper}
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
    const requireFutureDate = (key, message) => {
      const value = String(form[key] || "").trim();
      if (!value) return;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        nextErrors[key] = "Enter a valid date";
        return;
      }
      if (value <= todayIso) nextErrors[key] = message;
    };

	    if (!stepId || stepId === "company") {
      requireField("name", "Company name is required");
      requireField("contactPerson", "Contact person is required");
      requireField("businessType", "Business type is required");
      requireField("calidusCluster", "Calidus cluster is required");
      if (!Array.isArray(form.productAndServices) || form.productAndServices.length === 0) {
        nextErrors.productAndServices = "Product and Services is required";
      }
      requireField("businessDescription", "Business description is required");
      if (!form.supplierImage) nextErrors.supplierImage = "Supplier image is required";
      if (String(form.businessDescription || "").trim().length > BUSINESS_DESCRIPTION_MAX_LEN) {
        nextErrors.businessDescription = `Business description must be at most ${BUSINESS_DESCRIPTION_MAX_LEN} characters`;
      }
      if (String(form.manufacturingDescription || "").trim().length > MANUFACTURING_DESCRIPTION_MAX_LEN) {
        nextErrors.manufacturingDescription = `Manufacturing description must be at most ${MANUFACTURING_DESCRIPTION_MAX_LEN} characters`;
      }

      const sections = Array.isArray(form.manufacturingCapabilitySections)
        ? form.manufacturingCapabilitySections
        : [];
      sections.forEach((section, index) => {
        const title = String(section?.title || "").trim();
        const description = String(section?.description || "").trim();
        const image = String(section?.image || "").trim();

        if (!title) nextErrors[`manufacturingCapabilitySections.${index}.title`] = "Title is required";
        if (!description) nextErrors[`manufacturingCapabilitySections.${index}.description`] = "Description is required";
        if (description.length > MANUFACTURING_DESCRIPTION_MAX_LEN) {
          nextErrors[`manufacturingCapabilitySections.${index}.description`] =
            `Description must be at most ${MANUFACTURING_DESCRIPTION_MAX_LEN} characters`;
        }
        if (!image) nextErrors[`manufacturingCapabilitySections.${index}.image`] = "Image is required";
      });
      requireField("email", "Email is required");
      if (String(form.email || "").trim() && !emailRegex.test(String(form.email).trim())) {
        nextErrors.email = "Enter a valid email address";
      }
	      const licenseError = validateLicenseNumber(form.licenseNumber);
	      if (licenseError) nextErrors.licenseNumber = licenseError;

	      const vatError = validateVatNumber(form.vatNumber, form.countryCode, form.phoneCountryCode);
	      if (vatError) nextErrors.vatNumber = vatError;

	      requireField("currency", "Supplier currency is required");
	      requireField("phoneNumber", "Phone is required");
	      const nationalDigits = phoneDigits(form.phoneNumber);
	      const phoneCountry = form.country || getCountryNameFromDialCode(form.phoneCountryCode);
	      if (String(form.phoneNumber || "").trim()) {
	        const phoneError = validatePhoneNumber(`${String(form.phoneCountryCode || "").trim()}${nationalDigits}`, phoneCountry);
	        if (phoneError) nextErrors.phoneNumber = phoneError;
	      }

	    }

    if (!stepId || stepId === "address") {
      const country = String(form.country || getCountryNameFromDialCode(form.phoneCountryCode) || "").trim();
      const countryCode = String(form.countryCode || getCountryCodeFromDialCode(form.phoneCountryCode) || "").trim();
      const state = String(form.state || "").trim();
      const city = String(form.cityState || "").trim();
      const postalCode = String(form.postalCode || "").trim();

      requireField("addressLine1", "Address line 1 is required");
      requireField("addressLine2", "Address line 2 is required");
      if (!country || !countryCode) {
        nextErrors.phoneCountryCode = "Select a valid phone country code";
      }
      if (!state) {
        nextErrors.state = "State is required";
      }
      if (!city) {
        nextErrors.cityState = "City is required";
      }
      if (countryCode && form.stateCode && city && cityOptions.length && !cityOptions.some((option) => option.name === city)) {
        nextErrors.cityState = `Select a city available for ${state}`;
      }
      if (postalCode && countryCode) {
        const postalValidation = postalCodes.validate(countryCode, postalCode);
        if (postalValidation !== true) {
          nextErrors.postalCode = `Enter a valid postal code for ${country}`;
        }
      }
    }

	    if (!stepId || stepId === "docs") {
	      if (!form.tradeLicenseFile) nextErrors.tradeLicenseFile = "Trade license is required";
	      requireField("tradeLicenseExpiry", "Trade license expiry date is required");
	      requireFutureDate("tradeLicenseExpiry", "Trade license expiry date must be a future date");
	      if (!form.vatCertificateFile) nextErrors.vatCertificateFile = "VAT certificate is required";
	      requireField("vatCertificateExpiry", "VAT certificate expiry date is required");
	      requireFutureDate("vatCertificateExpiry", "VAT certificate expiry date must be a future date");

	      const selectedCerts = Array.isArray(form.certifications) ? form.certifications : [];
	      if (selectedCerts.includes("others") && !String(form.otherCertifications || "").trim()) {
	        nextErrors.otherCertifications = "Please specify your other certification(s)";
	      }
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
    const city = String(form.cityState || "").trim();
    const state = String(form.state || "").trim();

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

	    const selectedCerts = Array.isArray(form.certifications) ? form.certifications : [];
	    const otherCerts = String(form.otherCertifications || "")
	      .split(",")
	      .map((s) => s.trim())
	      .filter(Boolean);
	    const certificationsForPayload = selectedCerts
	      .filter((c) => c !== "others")
	      .concat(otherCerts);

	    const payload = {
      name: form.name.trim(),
      type: form.businessType,
      country: String(form.country || getCountryNameFromDialCode(form.phoneCountryCode) || "").trim(),
      email: form.email.trim(),
      phone: `${String(form.phoneCountryCode || "").trim()}${phoneDigits(form.phoneNumber)}`,
      image: form.supplierImage,
      joinDate,
      status: "pending",
      documentStatus: "active",
	      certifications: certificationsForPayload,
	      documents,
      // extra fields (passthrough)
      contactPerson: form.contactPerson,
      businessType: form.businessType,
      calidusCluster: form.calidusCluster,
      productAndServices: form.productAndServices,
      businessDescription: form.businessDescription.trim(),
      capabilities: form.capabilities,
      complianceRegistration: form.complianceRegistration,
      manufacturingCapabilitySections: Array.isArray(form.manufacturingCapabilitySections)
        ? form.manufacturingCapabilitySections.map((section) => ({
            title: String(section?.title || "").trim(),
            description: String(section?.description || "").trim(),
            image: String(section?.image || "").trim(),
          }))
        : [],
      manufacturingCapabilities: Array.isArray(form.manufacturingCapabilitySections)
        ? form.manufacturingCapabilitySections
            .map((section) => String(section?.title || "").trim())
            .filter(Boolean)
        : form.manufacturingCapabilities,
      manufacturingDescription: Array.isArray(form.manufacturingCapabilitySections) && form.manufacturingCapabilitySections.length > 0
        ? String(form.manufacturingCapabilitySections[0]?.description || "").trim()
        : form.manufacturingDescription.trim(),
      manufacturingImage: Array.isArray(form.manufacturingCapabilitySections) && form.manufacturingCapabilitySections.length > 0
        ? String(form.manufacturingCapabilitySections[0]?.image || "").trim()
        : form.manufacturingImage,
      supplierCurrency: form.currency,
      address: {
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city,
        state,
        stateCode: form.stateCode,
        postalCode: form.postalCode,
        country: String(form.country || getCountryNameFromDialCode(form.phoneCountryCode) || "").trim(),
        countryCode: String(form.countryCode || getCountryCodeFromDialCode(form.phoneCountryCode) || "").trim(),
      },
      licenseNumber: form.licenseNumber,
      vatNumber: form.vatNumber,
      linkedIn: form.linkedIn,
    };

    try {
      const created = await createSupplier(payload).unwrap();
      toast.success("Registration submitted. Your account is pending approval.");
      if (created?.credentials?.email && created?.credentials?.password) {
        setCredentialDialog({ open: true, credentials: created.credentials });
      } else {
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-background tactical-grid noise-overlay dashboard-bg-background">
      <Dialog
        open={credentialDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setCredentialDialog({ open: false, credentials: null });
            navigate("/login");
          }
        }}
      >
        <DialogContent className="border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
              Save Your Login Details
            </DialogTitle>
            <DialogDescription>
              Please copy these credentials now. They will disappear when you close this popup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-sm border border-border bg-black/20 p-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="mt-1 font-mono break-all">{credentialDialog.credentials?.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Password</p>
              <p className="mt-1 font-mono break-all">{credentialDialog.credentials?.password}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                downloadCredentialsJson(
                  credentialDialog.credentials,
                  "calidus-supplier-credentials.json",
                )
              }
            >
              Download JSON
            </Button>
            <Button
              type="button"
              onClick={async () => {
                try {
                  await copyCredentialsText(credentialDialog.credentials);
                  toast.success("Credentials copied");
                } catch (_) {
                  toast.error("Unable to copy credentials");
                }
              }}
            >
              Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <header className="fixed left-0 top-0 z-40 h-16 w-full border-b border-border bg-background/90 backdrop-blur-md dashboard-bg-background">
        <div className="h-full max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Calidus" className="h-8 w-28" />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/login")}>
              Login
            </Button>
          </div>
        </div>
      </header>

      <section className="relative pt-16">
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
                  <SupplierImageField />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Business Type *
                      </Label>

                      <Select
                        value={form.businessType}
                        onValueChange={(v) => {
                          if (v === "__add_custom__") {
                            setShowCustomBusinessType(true);
                            return;
                          }

                          setShowCustomBusinessType(false);
                          setCustomBusinessType("");
                          setField("businessType", v);
                        }}
                      >
                        <SelectTrigger
                          className={`bg-black/20 mt-1 ${errors.businessType ? "border-red-500/50" : ""}`}
                          data-testid="supplier-reg-business-type"
                        >
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>

                        <SelectContent>
                          {form.businessType &&
                          !businessTypeOptions.includes(form.businessType) &&
                          form.businessType !== "__add_custom__" && (
                            <SelectItem value={form.businessType}>
                              {form.businessType}
                            </SelectItem>
                          )}
                          {businessTypeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}

                          <SelectItem value="__add_custom__">
                            + Add your business type
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {showCustomBusinessType && (
                        <div className="mt-2 flex gap-2">
                          <Input
                            value={customBusinessType}
                            onChange={(e) => setCustomBusinessType(e.target.value)}
                            className="bg-black/20"
                            placeholder="Enter business type"
                          />

                          <Button
                            type="button"
                            onClick={() => {
                              const value = customBusinessType.trim();

                              if (!value) {
                                setErrors((prev) => ({
                                  ...prev,
                                  businessType: "Business type is required",
                                }));
                                return;
                              }

                              setField("businessType", value);
                              setShowCustomBusinessType(false);
                            }}
                          >
                            Enter
                          </Button>
                        </div>
                      )}

                      {errors.businessType && (
                        <p className="text-xs text-red-400 mt-1">{errors.businessType}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Calidus Cluster *
                      </Label>

                      <Select
                        value={form.calidusCluster}
                        onValueChange={(v) => {
                          if (v === "__add_custom_cluster__") {
                            setShowCustomCalidusCluster(true);
                            return;
                          }

                          setShowCustomCalidusCluster(false);
                          setCustomCalidusCluster("");
                          setField("calidusCluster", v);
                        }}
                      >
                        <SelectTrigger
                          className={`bg-black/20 mt-1 ${errors.calidusCluster ? "border-red-500/50" : ""}`}
                          data-testid="supplier-reg-calidus-cluster"
                        >
                          <SelectValue placeholder="Select calidus cluster" />
                        </SelectTrigger>

                        <SelectContent>
                          {form.calidusCluster &&
                            !calidusClusterOptions.includes(form.calidusCluster) &&
                            form.calidusCluster !== "__add_custom_cluster__" && (
                              <SelectItem value={form.calidusCluster}>
                                {form.calidusCluster}
                              </SelectItem>
                            )}

                          {calidusClusterOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}

                          <SelectItem value="__add_custom_cluster__">
                            + Add your cluster
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {showCustomCalidusCluster && (
                        <div className="mt-2 flex gap-2">
                          <Input
                            value={customCalidusCluster}
                            onChange={(e) => setCustomCalidusCluster(e.target.value)}
                            className="bg-black/20"
                            placeholder="Enter cluster name"
                          />

                          <Button
                            type="button"
                            onClick={() => {
                              const value = customCalidusCluster.trim();

                              if (!value) {
                                setErrors((prev) => ({
                                  ...prev,
                                  calidusCluster: "Calidus cluster is required",
                                }));
                                return;
                              }

                              setField("calidusCluster", value);
                              setShowCustomCalidusCluster(false);
                            }}
                          >
                            Enter
                          </Button>
                        </div>
                      )}

                      {errors.calidusCluster && (
                        <p className="text-xs text-red-400 mt-1">
                          {errors.calidusCluster}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative" ref={productServicesDropdownRef}>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Product and Services *
                    </Label>

                    <button
                      type="button"
                      onClick={() => setShowProductServicesDropdown((prev) => !prev)}
                      className={`mt-1 flex min-h-10 w-full items-center justify-between rounded-md border bg-black/20 px-3 py-2 text-left text-sm ${
                        errors.productAndServices ? "border-red-500/50" : "border-input"
                      }`}
                      data-testid="supplier-reg-product-services"
                    >
                      <span className="line-clamp-1">
                        {Array.isArray(form.productAndServices) && form.productAndServices.length > 0
                          ? form.productAndServices.join(", ")
                          : "Select Product and Services"}
                      </span>
                    </button>

                    {showProductServicesDropdown && (
                      <div className="absolute z-50 mt-2 w-full rounded-md border border-border bg-card p-2 shadow-lg">
                        <ScrollArea className="h-72">
                          <button
                            type="button"
                            onClick={() => {setShowCustomProductAndServices(true);
                                            setShowProductServicesDropdown(false);
                            }}
                            className="flex w-full items-center rounded-sm px-2 py-2 text-left text-sm hover:bg-muted/30"
                          >
                            + Add your product/service
                          </button>

                          {allProductAndServicesOptions.map((option) => {
                            const selected =
                              Array.isArray(form.productAndServices) &&
                              form.productAndServices.includes(option);

                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  const prev = Array.isArray(form.productAndServices)
                                    ? form.productAndServices
                                    : [];

                                  const next = selected
                                    ? prev.filter((item) => item !== option)
                                    : [...prev, option];

                                  setField("productAndServices", next);
                                }}
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-muted/30"
                              >
                                <input type="checkbox" checked={selected} readOnly className="h-4 w-4" />
                                <span>{option}</span>
                              </button>
                            );
                          })}
                        </ScrollArea>
                      </div>
                    )}

                    {showCustomProductAndServices && (
                      <div className="mt-2 flex gap-2">
                        <Input
                          value={customProductAndServices}
                          onChange={(e) => setCustomProductAndServices(e.target.value)}
                          className="bg-black/20"
                          placeholder="Enter product/service"
                        />

                        <Button
                          type="button"
                          onClick={() => {
                            const value = customProductAndServices.trim();

                            if (!value) {
                              setErrors((prev) => ({
                                ...prev,
                                productAndServices: "Product and Services is required",
                              }));
                              return;
                            }

                            const prev = Array.isArray(form.productAndServices)
                              ? form.productAndServices
                              : [];

                            setCustomProductAndServicesOptions((prevOptions) =>
                              prevOptions.includes(value) || productAndServicesOptions.includes(value)
                                ? prevOptions
                                : [...prevOptions, value]
                            );

                            setField("productAndServices", prev.includes(value) ? prev : [...prev, value]);
                            setCustomProductAndServices("");
                            setShowCustomProductAndServices(false);
                          }}
                        >
                          Enter
                        </Button>
                      </div>
                    )}

                    {errors.productAndServices && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors.productAndServices}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Business Description *
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {form.businessDescription.length}/{BUSINESS_DESCRIPTION_MAX_LEN}
                      </span>
                    </div>
                    <Textarea
                      value={form.businessDescription}
                      onChange={(e) => setField("businessDescription", e.target.value.slice(0, BUSINESS_DESCRIPTION_MAX_LEN))}
                      className={`bg-black/20 mt-1 min-h-32 ${errors.businessDescription ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                      placeholder="Describe your business in under 700 letters"
                      maxLength={BUSINESS_DESCRIPTION_MAX_LEN}
                      data-testid="supplier-reg-business-description"
                    />
                    {errors.businessDescription && (
                      <p className="text-xs text-red-400 mt-1">{errors.businessDescription}</p>
                    )}
                  </div>

                  <div className="space-y-4 rounded-sm border border-border bg-black/10 p-4">
                    <p className="text-lg font-bold font-['Barlow_Condensed'] uppercase tracking-wide">
                      Capabilities
                    </p>
                    <ChipInputField
                      label="Capabilities"
                      required={false}
                      values={form.capabilities}
                      onChange={(value) => setField("capabilities", value)}
                      placeholder="Type a capability and press Enter"
                      error={errors.capabilities}
                      testId="supplier-reg-capabilities"
                    />
                  </div>

                  <div className="space-y-4 rounded-sm border border-border bg-black/10 p-4">
                    <ManufacturingSectionsField
                      sections={manufacturingSections}
                      maxDescriptionLen={MANUFACTURING_DESCRIPTION_MAX_LEN}
                      maxImageMb={SUPPLIER_IMAGE_MAX_MB}
                      onAddSection={addManufacturingSection}
                      onRemoveSection={removeManufacturingSection}
                      onUpdateSection={updateManufacturingSection}
                      onSetSectionImage={setManufacturingSectionImage}
                      getSectionError={getManufacturingSectionError}
                    />
                  </div>

                  <div className="space-y-4 rounded-sm border border-border bg-black/10 p-4">
                    <p className="text-lg font-bold font-['Barlow_Condensed'] uppercase tracking-wide">
                      Compliance Registration
                    </p>
                    <ChipInputField
                      label="Compliance Registration"
                      required={false}
                      values={form.complianceRegistration}
                      onChange={(value) => setField("complianceRegistration", value)}
                      placeholder="Type a compliance and press Enter"
                      error={errors.complianceRegistration}
                      testId="supplier-reg-compliance-registration"
                    />
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
                        <div className="mt-1 grid grid-cols-[140px_1fr] gap-2">
                          <Select value={form.phoneCountryCode} onValueChange={setPhoneCountryCode}>
                            <SelectTrigger className="bg-black/20" data-testid="supplier-reg-phone-country-code">
                              <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            <SelectContent>
                              {callingCodeOptions.map((opt) => (
                                <SelectItem key={opt.label} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
	                          <Input
	                            type="tel"
	                            inputMode="numeric"
	                            value={form.phoneNumber}
	                            onChange={(e) => setField("phoneNumber", phoneNationalDigits(e.target.value))}
	                            className={`bg-black/20 ${errors.phoneNumber ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
	                            placeholder="Mobile number"
	                            minLength={PHONE_NATIONAL_MIN_DIGITS}
	                            maxLength={PHONE_NATIONAL_MAX_DIGITS}
	                            data-testid="supplier-reg-phone"
	                          />
                        </div>
                        {errors.phoneCountryCode && <p className="text-xs text-red-400 mt-1">{errors.phoneCountryCode}</p>}
                        {errors.phoneNumber && <p className="text-xs text-red-400 mt-1">{errors.phoneNumber}</p>}
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        License Number *
                      </Label>
	                      <Input
	                        value={form.licenseNumber}
	                        onChange={(e) => setField("licenseNumber", normalizeRefId(e.target.value, LICENSE_NUMBER_MAX_LEN))}
	                        className={`bg-black/20 mt-1 ${errors.licenseNumber ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
	                        placeholder="Enter license number"
	                        minLength={LICENSE_NUMBER_MIN_LEN}
	                        maxLength={LICENSE_NUMBER_MAX_LEN}
	                        pattern="[A-Za-z0-9/_-]+"
	                        data-testid="supplier-reg-license"
	                      />
                      {errors.licenseNumber && (
                        <p className="text-xs text-red-400 mt-1">{errors.licenseNumber}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        VAT / Tax Number *
                      </Label>
	                      <Input
	                        value={form.vatNumber}
	                        onChange={(e) => setField("vatNumber", normalizeVatNumberInput(e.target.value))}
	                        className={`bg-black/20 mt-1 ${errors.vatNumber ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
	                        placeholder="e.g. 100123456789012"
	                        minLength={VAT_NUMBER_MIN_LEN}
	                        maxLength={VAT_NUMBER_MAX_LEN}
	                        pattern="[A-Za-z0-9-]+"
	                        data-testid="supplier-reg-vat"
	                      />
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Format is checked using the country identified from the phone code.
                      </p>
                      {errors.vatNumber && <p className="text-xs text-red-400 mt-1">{errors.vatNumber}</p>}
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

                  {/* <div className="rounded-sm border border-border bg-black/10 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Country</p>
                    <p className="mt-1 text-sm font-medium">{form.country || "Select phone code first"}</p>
                  </div> */}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        State *
                      </Label>
                      <Select value={form.stateCode} onValueChange={setAddressState} disabled={!form.countryCode}>
                        <SelectTrigger
                          className={`bg-black/20 mt-1 ${errors.state ? "border-red-500/50" : ""}`}
                          data-testid="supplier-reg-state"
                        >
                          <SelectValue placeholder={form.countryCode ? "Select state" : "Select phone code first"} />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-72">
                            {stateOptions.map((state) => (
                              <SelectItem key={state.isoCode} value={state.isoCode}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                      {errors.state && (
                        <p className="text-xs text-red-400 mt-1">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        City *
                      </Label>
                      <Select value={form.cityState} onValueChange={(v) => setField("cityState", v)} disabled={!form.stateCode}>
                        <SelectTrigger
                          className={`bg-black/20 mt-1 ${errors.cityState ? "border-red-500/50" : ""}`}
                          data-testid="supplier-reg-city-state"
                        >
                          <SelectValue placeholder={form.stateCode ? "Select city" : "Select state first"} />
                        </SelectTrigger>
                          <SelectContent>
                            <ScrollArea className="h-72">
                              {cityOptions.map((city) => (
                                <SelectItem key={`${city.name}-${city.latitude}-${city.longitude}`} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                      </Select>
                      {errors.cityState && (
                        <p className="text-xs text-red-400 mt-1">{errors.cityState}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        ZIP / Postal Code
                      </Label>
                      <Input
                        value={form.postalCode}
                        onChange={(e) => setField("postalCode", e.target.value)}
                        className={`bg-black/20 mt-1 ${errors.postalCode ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                        placeholder={form.cityState ? "Enter postal code" : "Select city first"}
                        data-testid="supplier-reg-postal"
                      />
                      {errors.postalCode && (
                        <p className="text-xs text-red-400 mt-1">{errors.postalCode}</p>
                      )}
                    </div>
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
	                      min={tomorrowIso}
	                      className={`date-icon-white bg-muted/20 mt-1 ${errors.tradeLicenseExpiry ? "border-red-500/50" : ""}`}
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
	                      min={tomorrowIso}
	                      className={`date-icon-white bg-muted/20 mt-1 ${errors.vatCertificateExpiry ? "border-red-500/50" : ""}`}
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
                              if (selected && c === "others") setField("otherCertifications", "");
                            }}
                            data-testid={`supplier-reg-cert-${c.replace(/\s+/g, "-").toLowerCase()}`}
                          >
                            {c === "others" ? "Others" : c}
                          </button>
                        );
                      })}
                    </div>
                    {Array.isArray(form.certifications) && form.certifications.includes("others") && (
                      <div className="mt-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                          Other Certifications (comma-separated)
                        </Label>
                        <Input
                          value={form.otherCertifications}
                          onChange={(e) => setField("otherCertifications", e.target.value)}
                          placeholder="e.g. ISO 27001, NADCAP"
                          className={`bg-muted/20 mt-1 ${errors.otherCertifications ? "border-red-500/50" : ""}`}
                          disabled={isSubmitting}
                          data-testid="supplier-reg-cert-other-input"
                        />
                        {errors.otherCertifications && (
                          <p className="text-xs text-red-400 mt-1">{errors.otherCertifications}</p>
                        )}
                      </div>
                    )}
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
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground">Supplier Image</p>
                        {form.supplierImage ? (
                          <img
                            src={form.supplierImage}
                            alt="Supplier preview"
                            className="mt-2 h-28 w-40 rounded-sm border border-border object-cover"
                          />
                        ) : (
                          <p className="font-medium mt-1">-</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Company Name</p>
                          <p className="font-medium mt-1">{form.name || "-"}</p>
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
                          <p className="font-medium mt-1">
                            {form.phoneNumber ? `${form.phoneCountryCode} ${form.phoneNumber}` : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Currency</p>
                          <p className="font-medium mt-1">{form.currency || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Business Type</p>
                          <p className="font-medium mt-1">{form.businessType || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Calidus Cluster</p>
                          <p className="font-medium mt-1">{form.calidusCluster || "-"}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground">Product and Services</p>
                          <p className="font-medium mt-1">{form.productAndServices || "-"}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground">Business Description</p>
                          <p className="font-medium mt-1 whitespace-pre-wrap">{form.businessDescription || "-"}</p>
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
