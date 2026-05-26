import { useEffect, useMemo, useRef, useState } from "react";
import ReactSelect from "react-select";
import countryList from "react-select-country-list";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";
import { Award, Building2, Calendar, Edit, FileCheck, FileWarning, FileX, ImagePlus, Mail, MapPin, Phone, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/App";
import { currentSupplier } from "@/data/mockData";
import { useGetSupplierProfileQuery, useUpdateSupplierProfileMutation } from "@/store/api/supplier/supplierProfileApi";
import { validatePhoneNumber } from "@/lib/phoneValidation";

const defaultProfileDocuments = [
  { name: "Trade License", type: "trade_license", status: "pending", expiryDate: "" },
  { name: "VAT Certificate", type: "vat_certificate", status: "pending", expiryDate: "" },
];

const SUPPLIER_IMAGE_MAX_MB = 5;

const pad2 = (n) => String(n).padStart(2, "0");
const toLocalISODate = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const getTomorrowLocalISODate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return toLocalISODate(d);
};
const isOnOrAfter = (dateString, minDateString) =>
  String(dateString || "") >= String(minDateString || "");
const isFutureDateSelected = (dateString, minDateString) => {
  const normalized = String(dateString || "").trim();
  if (!normalized) return false;
  return isOnOrAfter(normalized, minDateString);
};

const formatDocumentName = (document = {}) =>
  document.name ||
  String(document.type || "Document")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getEffectiveDocumentStatus = (document = {}) => {
  const expiryDateValue = document.expiryDate;
  if (expiryDateValue) {
    const expiryDate = new Date(expiryDateValue);
    if (!Number.isNaN(expiryDate.getTime())) {
      expiryDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) return "expired";
    }
  }

  return document.status || "active";
};

const normalizeDocuments = (documents = []) => {
  const source = Array.isArray(documents) ? documents : [];
  const byType = source.reduce((acc, document) => {
    const key = document.type || document.name;
    if (key) acc[String(key)] = document;
    return acc;
  }, {});

  const mergedDefaults = defaultProfileDocuments.map((defaultDocument) => ({
    ...defaultDocument,
    ...(byType[defaultDocument.type] || {}),
  }));

  const extraDocuments = source.filter((document) => {
    const key = document.type || document.name;
    if (String(key || "").toLowerCase() === "datasheet") return false;
    return !defaultProfileDocuments.some(
      (defaultDocument) => defaultDocument.type === key || defaultDocument.name === key
    );
  });

  return [...mergedDefaults, ...extraDocuments].map((document) => ({
    ...document,
    name: formatDocumentName(document),
    status: getEffectiveDocumentStatus(document),
  }));
};

export const SupplierProfile = () => {
  const { currentUser } = useAuth();
  const supplierId = currentUser?.profileId || currentSupplier.id;
  const { data: supplier = {}, isLoading, error } = useGetSupplierProfileQuery(supplierId);
  const [updateSupplierProfile, { isLoading: isSaving }] = useUpdateSupplierProfileMutation();
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [uploadDocDialog, setUploadDocDialog] = useState({ open: false, document: null });
  const [profileForm, setProfileForm] = useState({});
  const [selectedDocumentFile, setSelectedDocumentFile] = useState(null);
  const [selectedDocumentExpiryDate, setSelectedDocumentExpiryDate] = useState("");
  const documentInputRef = useRef(null);
  const [profileErrors, setProfileErrors] = useState({});
  const minExpiryDate = useMemo(() => getTomorrowLocalISODate(), []);
  const documentsRequireFutureExpiry = useMemo(
    () => (profileForm.documents || []).some((d) => Boolean(String(d?.fileName || "").trim())),
    [profileForm.documents]
  );
  const canSaveProfile =
    !documentsRequireFutureExpiry ||
    (profileForm.documents || []).every((d) => {
      if (!String(d?.fileName || "").trim()) return true;
      return isFutureDateSelected(d?.expiryDate, minExpiryDate);
    });
  const canUploadDocument =
    Boolean(selectedDocumentFile) && isFutureDateSelected(selectedDocumentExpiryDate, minExpiryDate);
  
  useEffect(() => {
    if (uploadDocDialog.open) {
      setSelectedDocumentExpiryDate(String(uploadDocDialog.document?.expiryDate || ""));
    } else {
      setSelectedDocumentExpiryDate("");
    }
  }, [uploadDocDialog.open, uploadDocDialog.document]);

  const openEdit = () => {
    setProfileForm({
      ...supplier,
      documents: normalizeDocuments(supplier.documents || []),
    });
    setEditProfileDialog(true);
  };

  const validateDocumentFile = (file) => {
    if (!file) {
      toast.error("Please select a PDF or DOC file first");
      return false;
    }

    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, DOC, and DOCX files are allowed");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be 10MB or smaller");
      return false;
    }

    return true;
  };

  const getDocumentStatus = (documents = []) => {
    if (documents.some((document) => getEffectiveDocumentStatus(document) === "expired")) return "expired";
    if (documents.some((document) => getEffectiveDocumentStatus(document) === "expiring")) return "expiring";
    return "active";
  };

  const applyUploadedFileToDocument = (document, file) => ({
    ...document,
    name: formatDocumentName(document),
    status: "active",
    expiryDate:
      String(document?.expiryDate || "").trim() ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
  });

  const handleEditDocumentFile = (index, file) => {
    if (!validateDocumentFile(file)) return;

    const updatedDocuments = (profileForm.documents || []).map((document, documentIndex) =>
      documentIndex === index ? applyUploadedFileToDocument(document, file) : document
    );

    setProfileForm({
      ...profileForm,
      documents: updatedDocuments,
      documentStatus: getDocumentStatus(updatedDocuments),
    });
  };

  const updateDocumentExpiryDate = (index, expiryDate) => {
    const normalized = String(expiryDate || "").trim();
    if (normalized && !isOnOrAfter(normalized, minExpiryDate)) {
      toast.error("Expiry date must be a future date");
      return;
    }
    const updatedDocuments = (profileForm.documents || []).map((document, documentIndex) =>
      documentIndex === index ? { ...document, expiryDate: normalized } : document
    );

    setProfileForm({
      ...profileForm,
      documents: updatedDocuments,
      documentStatus: getDocumentStatus(updatedDocuments),
    });
  };

  const handleProfileImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileErrors((current) => ({ ...current, image: "Please select a valid image file" }));
      return;
    }

    if (file.size > SUPPLIER_IMAGE_MAX_MB * 1024 * 1024) {
      setProfileErrors((current) => ({ ...current, image: `Image must be ${SUPPLIER_IMAGE_MAX_MB}MB or smaller` }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((current) => ({
        ...current,
        image: String(reader.result || ""),
        imageFileName: file.name,
      }));
      setProfileErrors((current) => {
        const next = { ...current };
        delete next.image;
        return next;
      });
    };
    reader.onerror = () => {
      setProfileErrors((current) => ({ ...current, image: "Unable to read selected image" }));
    };
    reader.readAsDataURL(file);
  };

  const validateProfileForm = () => {
    const errors = {};

    const companyName = String(profileForm.name || "").trim();

    if (!companyName) {
      errors.name = "Company name is required";
    } else if (companyName.length < 1) {
      errors.name = "Company name must be at least 1 characters";
    } else if (companyName.length > 50) {
      errors.name = "Company name cannot exceed 50 characters";
    }

    if (!String(profileForm.type || "").trim()) {
      errors.type = "Supplier type is required";
    }

    if (!String(profileForm.country || "").trim()) {
      errors.country = "Country is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(profileForm.email || "").trim())) {
      errors.email = "Enter a valid email address";
    }

    const phoneError = validatePhoneNumber(profileForm.phone, profileForm.country);
    if (phoneError) {
      errors.phone = phoneError;
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {

    if(!validateProfileForm()) return;

    const documents = profileForm.documents || [];
    const invalidExpiry = documents.some((doc) => {
      const expiry = String(doc?.expiryDate || "").trim();
      return expiry && !isOnOrAfter(expiry, minExpiryDate);
    });
    if (invalidExpiry) {
      toast.error("Please set document expiry dates to a future date");
      return;
    }

    try {
      const updated = await updateSupplierProfile({
        supplierId: supplier.id,
        payload: {
          name: profileForm.name,
          type: profileForm.type,
          country: profileForm.country,
          email: profileForm.email,
          phone: profileForm.phone,
          image: profileForm.image || null,
          documents,
          documentStatus: getDocumentStatus(documents),
        },
      }).unwrap();
      setProfileForm(updated);
      toast.success("Company profile updated successfully");
      setEditProfileDialog(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update company profile");
    }
  };

  const countryOptions = useMemo(() => countryList().getData(), []);
  if (isLoading) return <p>Loading company profile...</p>;
  if (error) return <p>Failed to load company profile.</p>;
  const profileDocuments = normalizeDocuments(supplier.documents || []);

  const handleUploadDocument = async () => {
    if (!validateDocumentFile(selectedDocumentFile)) return;
    const normalizedExpiry = String(selectedDocumentExpiryDate || "").trim();
    if (normalizedExpiry && !isOnOrAfter(normalizedExpiry, minExpiryDate)) {
      toast.error("Expiry date must be a future date");
      return;
    }

    const updatedDocs = profileDocuments.map((doc) =>
      (doc.type || doc.name) === (uploadDocDialog.document.type || uploadDocDialog.document.name)
        ? {
            ...applyUploadedFileToDocument(doc, selectedDocumentFile),
            expiryDate: normalizedExpiry || doc.expiryDate || "",
          }
        : doc
    );

    try {
      await updateSupplierProfile({
        supplierId: supplier.id,
        payload: { documents: updatedDocs, documentStatus: getDocumentStatus(updatedDocs) },
      }).unwrap();
      toast.success(`${uploadDocDialog.document.name} re-uploaded successfully`);
      setUploadDocDialog({ open: false, document: null });
      setSelectedDocumentFile(null);
      setSelectedDocumentExpiryDate("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to upload document");
    }
  };

  return (
    <>
      <div className="space-y-6" data-testid="company-profile">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Company Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your company information</p>
          </div>
          <Button onClick={openEdit} className="gap-2" data-testid="edit-profile-btn">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header"><h3 className="dashboard-card-title">Company Information</h3></div>
              <div className="dashboard-card-content space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="h-24 w-24 overflow-hidden rounded-sm border border-border bg-muted/20">
                    {supplier.image ? (
                      <img src={supplier.image} alt={supplier.name || "Supplier"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Supplier Image</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {supplier.image ? "Image uploaded" : "No image uploaded"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Info label="Company Name" value={supplier.name} />
                  <Info label="Supplier Type" value={supplier.type} />
                  <IconInfo label="Country" value={supplier.country} icon={MapPin} />
                  <IconInfo label="Email" value={supplier.email} icon={Mail} />
                  <IconInfo label="Phone" value={supplier.phone} icon={Phone} />
                  <IconInfo label="Member Since" value={supplier.joinDate} icon={Calendar} />
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header"><h3 className="dashboard-card-title">Documents & Certifications</h3></div>
              <div className="dashboard-card-content space-y-3">
                {profileDocuments.map((doc, idx) => (
                  <DocumentRow
                    key={`${doc.name}-${idx}`}
                    doc={doc}
                    idx={idx}
                    onUpload={() => setUploadDocDialog({ open: true, document: doc })}
                  />
                ))}
              </div>
            </div>

            {/* <div className="dashboard-card">
              <div className="dashboard-card-header"><h3 className="dashboard-card-title">Certifications</h3></div>
              <div className="dashboard-card-content">
                <div className="flex flex-wrap gap-3">
                  {(supplier.certifications || []).map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          </div>

          <div className="space-y-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header"><h3 className="dashboard-card-title">Profile Completion</h3></div>
              <div className="dashboard-card-content">
                <div className="text-center mb-4"><span className="text-4xl font-bold font-['Barlow_Condensed']">85%</span></div>
                <Progress value={85} className="h-2 mb-4" />
                <p className="text-xs text-muted-foreground">Complete your profile to increase visibility</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editProfileDialog} onOpenChange={setEditProfileDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Company Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Company Name</Label>
              <Input value={profileForm.name || ""} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} className="bg-black/20 mt-1" />
              <FieldError error={profileErrors.name} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Supplier Image</Label>
              <div className={`mt-1 grid gap-4 rounded-sm border bg-black/10 p-3 md:grid-cols-[140px_1fr] ${profileErrors.image ? "border-red-500/50" : "border-border"}`}>
                <div className="h-28 overflow-hidden rounded-sm border border-border bg-muted/20">
                  {profileForm.image ? (
                    <img src={profileForm.image} alt="Supplier preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus className="h-7 w-7 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      handleProfileImageFile(event.target.files?.[0] || null);
                      event.target.value = "";
                    }}
                    className="bg-black/20 file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-semibold file:text-primary-foreground"
                    data-testid="edit-profile-image"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a new company logo or supplier image. JPG, PNG, WEBP up to {SUPPLIER_IMAGE_MAX_MB}MB.
                  </p>
                  {profileForm.imageFileName && (
                    <p className="text-xs text-muted-foreground truncate">Selected: {profileForm.imageFileName}</p>
                  )}
                </div>
              </div>
              <FieldError error={profileErrors.image} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
                <Select value={profileForm.type || ""} onValueChange={(value) => setProfileForm({ ...profileForm, type: value })}>
                  <SelectTrigger className="bg-black/20 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OEM">OEM</SelectItem>
                    <SelectItem value="Tier 1">Tier 1</SelectItem>
                    <SelectItem value="Tier 2">Tier 2</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError error={profileErrors.type} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Country</Label>
                <div className="mt-1">
                  <ReactSelect
                    options={countryOptions}
                    value={countryOptions.find(
                      (option) => option.label === profileForm.country
                    )}
                    onChange={(selectedOption) =>
                      setProfileForm({
                        ...profileForm,
                        country: selectedOption?.label || "",
                      })
                    }
                    placeholder="Select Country"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: "#121212",
                        borderColor: "#2a2a2a",
                        color: "white",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#121212",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "white",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? "#2563eb" : "#121212",
                        color: "white",
                      }),
                      input: (base) => ({ 
                        ...base,
                        color: "white",
                      }),
                    }}
                  />
                  <FieldError error={profileErrors.country} />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input value={profileForm.email || ""} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} className="bg-black/20 mt-1" />
              <FieldError error={profileErrors.email} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
              <PhoneInput
                country={"ae"}
                value={profileForm.phone || ""}
                onChange={(value) => setProfileForm({ ...profileForm, phone: value })}
                inputClass="!w-full !h-[40px] !bg-black/20 !text-white !border-[#2a2a2a]"
                buttonClass="!bg-black/20 !border-[#2a2a2a]"
                dropdownClass="!bg-[#070709] !text-white [&_.country:hover]:!bg-[#151518] [&_.country.highlight]:!bg-[#151518]"
                containerClass="mt-1 phone-input-container"
              />
              <FieldError error={profileErrors.phone} />
            </div>
            <div className="pt-2 border-t border-border">
              <div className="mb-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Documents</Label>
                <p className="text-xs text-muted-foreground mt-1">Existing documents are shown below. Choose a new file to replace any document.</p>
              </div>
              <div className="space-y-3">
                {(profileForm.documents || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground rounded-sm border border-border p-3">No documents uploaded yet.</p>
                ) : (
                  (profileForm.documents || []).map((doc, idx) => {
                    const status = getEffectiveDocumentStatus(doc);

                    return (
                    <div key={`${doc.name}-${idx}`} className="rounded-sm border border-border bg-black/10 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {status === "expired" ? <FileX className="h-4 w-4 shrink-0 text-red-400" /> :
                             status === "expiring" ? <FileWarning className="h-4 w-4 shrink-0 text-amber-400" /> :
                             <FileCheck className="h-4 w-4 shrink-0 text-emerald-400" />}
                            <p className="text-sm font-medium truncate">{formatDocumentName(doc)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Expires: {doc.expiryDate || "N/A"}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            Current file: {doc.fileName || "No file name saved"}
                          </p>
                        </div>
                        <span className={`text-xs uppercase ${
                          status === "expired" ? "text-red-400" :
                          status === "expiring" ? "text-amber-400" :
                          "text-emerald-400"
                        }`}>
                          {status}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Expiry Date
                          </Label>
                          <Input
                            type="date"
                            value={doc.expiryDate || ""}
                            onChange={(event) => updateDocumentExpiryDate(idx, event.target.value)}
                            min={minExpiryDate}
                            className="bg-black/20 mt-1"
                            data-testid={`edit-profile-doc-expiry-${idx}`}
                            disabled={isSaving}
                          />
                          {String(doc?.fileName || "").trim() && (
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              Required when a document is uploaded
                            </p>
                          )}
                        </div>
                        <div className="flex items-end">
                          <div className="w-full">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Replace File
                            </Label>
                            <div className="mt-1">
                              <input
                                id={`edit-profile-doc-input-${idx}`}
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="hidden"
                                onChange={(event) => {
                                  handleEditDocumentFile(idx, event.target.files?.[0] || null);
                                  event.target.value = "";
                                }}
                                data-testid={`edit-profile-doc-input-${idx}`}
                              />
                              <label
                                htmlFor={`edit-profile-doc-input-${idx}`}
                                className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                data-testid={`edit-profile-doc-upload-${idx}`}
                              >
                                <Upload className="h-4 w-4" />
                                Upload / Replace
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={isSaving || !canSaveProfile} data-testid="save-profile-btn">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={uploadDocDialog.open}
        onOpenChange={(open) => {
          setUploadDocDialog({ ...uploadDocDialog, open });
          if (!open) {
            setSelectedDocumentFile(null);
            setSelectedDocumentExpiryDate("");
          } else {
            setSelectedDocumentExpiryDate(String(uploadDocDialog.document?.expiryDate || ""));
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Re-upload Document</DialogTitle>
            {uploadDocDialog.document && (
              <DialogDescription>Uploading new version of: {uploadDocDialog.document.name}</DialogDescription>
            )}
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Expiry Date
              </Label>
              <Input
                type="date"
                value={selectedDocumentExpiryDate || ""}
                onChange={(event) => {
                  const next = String(event.target.value || "").trim();
                  if (next && !isOnOrAfter(next, minExpiryDate)) {
                    toast.error("Expiry date must be a future date");
                    return;
                  }
                  setSelectedDocumentExpiryDate(next);
                }}
                min={minExpiryDate}
                className="bg-black/20 mt-1"
                data-testid="document-expiry-date"
                disabled={isSaving}
              />
            </div>
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(event) => setSelectedDocumentFile(event.target.files?.[0] || null)}
              data-testid="document-file-input"
            />
            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-sm p-8 text-center hover:border-primary/60 transition-colors"
              data-testid="document-upload-dropzone"
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{selectedDocumentFile ? selectedDocumentFile.name : "Click to select file"}</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOC up to 10MB</p>
            </button>
            {selectedDocumentFile && (
              <p className="text-xs text-muted-foreground mt-2">{(selectedDocumentFile.size / 1024 / 1024).toFixed(2)} MB selected</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDocDialog({ open: false, document: null });
                setSelectedDocumentFile(null);
                setSelectedDocumentExpiryDate("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={!canUploadDocument || isSaving} data-testid="upload-doc-btn">
              {isSaving ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
    <p className="font-medium">{value || "N/A"}</p>
  </div>
);

const FieldError = ({ error }) =>
  error ? (
    <p className="text-red-400 text-xs mt-1">{error}</p>
  ) : null;


const IconInfo = ({ label, value, icon: Icon }) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{value || "N/A"}</span>
    </div>
  </div>
);

const DocumentRow = ({ doc, idx, onUpload }) => {
  const status = getEffectiveDocumentStatus(doc);

  return (
    <div className={`p-3 rounded-sm flex items-center justify-between ${
      status === "expired" ? "bg-red-500/10 border border-red-500/20" :
      status === "expiring" ? "bg-amber-500/10 border border-amber-500/20" :
      "bg-muted/30"
    }`}>
      <div className="flex items-center gap-3">
        {status === "expired" ? <FileX className="h-5 w-5 text-red-400" /> :
         status === "expiring" ? <FileWarning className="h-5 w-5 text-amber-400" /> :
         <FileCheck className="h-5 w-5 text-emerald-400" />}
        <div>
          <p className="text-sm font-medium">{doc.name}</p>
          <p className={`text-xs ${status === "expired" ? "text-red-400" : status === "expiring" ? "text-amber-400" : "text-muted-foreground"}`}>
            {status === "expired" ? "EXPIRED" : `Expires: ${doc.expiryDate || "N/A"}`}
          </p>
          {doc.fileName && <p className="text-xs text-muted-foreground">Uploaded: {doc.fileName}</p>}
        </div>
      </div>
      <Button variant="outline" size="sm" className="gap-1" onClick={onUpload} data-testid={`reupload-doc-${idx}`}>
        <RefreshCw className="h-3 w-3" />
        Re-upload
      </Button>
    </div>
  );
};
