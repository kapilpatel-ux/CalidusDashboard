import { useMemo, useRef, useState } from "react";
import ReactSelect from "react-select";
import countryList from "react-select-country-list";
import { toast } from "sonner";
import { Award, Building2, Calendar, Edit, FileCheck, FileWarning, FileX, Mail, MapPin, Phone, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/App";
import { currentSupplier } from "@/data/mockData";
import { useGetSupplierProfileQuery, useUpdateSupplierProfileMutation } from "@/store/api/supplier/supplierProfileApi";

export const SupplierProfile = () => {
  const { currentUser } = useAuth();
  const supplierId = currentUser?.profileId || currentSupplier.id;
  const { data: supplier = {}, isLoading, error } = useGetSupplierProfileQuery(supplierId);
  const [updateSupplierProfile, { isLoading: isSaving }] = useUpdateSupplierProfileMutation();
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [uploadDocDialog, setUploadDocDialog] = useState({ open: false, document: null });
  const [profileForm, setProfileForm] = useState({});
  const [selectedDocumentFile, setSelectedDocumentFile] = useState(null);
  const documentInputRef = useRef(null);

  const openEdit = () => {
    setProfileForm({
      ...supplier,
      documents: (supplier.documents || []).map((document) => ({ ...document })),
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
    if (documents.some((document) => document.status === "expired")) return "expired";
    if (documents.some((document) => document.status === "expiring")) return "expiring";
    return "active";
  };

  const applyUploadedFileToDocument = (document, file) => ({
    ...document,
    status: "active",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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

  const handleSaveProfile = async () => {
    const documents = profileForm.documents || [];

    try {
      const updated = await updateSupplierProfile({
        supplierId: supplier.id,
        payload: {
          name: profileForm.name,
          type: profileForm.type,
          country: profileForm.country,
          email: profileForm.email,
          phone: profileForm.phone,
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

  const handleUploadDocument = async () => {
    if (!validateDocumentFile(selectedDocumentFile)) return;

    const updatedDocs = (supplier.documents || []).map((doc) =>
      doc.name === uploadDocDialog.document.name
        ? applyUploadedFileToDocument(doc, selectedDocumentFile)
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
                {(supplier.documents || []).map((doc, idx) => (
                  <DocumentRow
                    key={`${doc.name}-${idx}`}
                    doc={doc}
                    idx={idx}
                    onUpload={() => setUploadDocDialog({ open: true, document: doc })}
                  />
                ))}
              </div>
            </div>

            <div className="dashboard-card">
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
            </div>
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
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input value={profileForm.email || ""} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} className="bg-black/20 mt-1" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
              <Input value={profileForm.phone || ""} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} className="bg-black/20 mt-1" />
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
                  (profileForm.documents || []).map((doc, idx) => (
                    <div key={`${doc.name}-${idx}`} className="rounded-sm border border-border bg-black/10 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {doc.status === "expired" ? <FileX className="h-4 w-4 shrink-0 text-red-400" /> :
                             doc.status === "expiring" ? <FileWarning className="h-4 w-4 shrink-0 text-amber-400" /> :
                             <FileCheck className="h-4 w-4 shrink-0 text-emerald-400" />}
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Expires: {doc.expiryDate || "N/A"}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            Current file: {doc.fileName || "No file name saved"}
                          </p>
                        </div>
                        <span className={`text-xs uppercase ${
                          doc.status === "expired" ? "text-red-400" :
                          doc.status === "expiring" ? "text-amber-400" :
                          "text-emerald-400"
                        }`}>
                          {doc.status || "active"}
                        </span>
                      </div>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="mt-3 bg-black/20"
                        onChange={(event) => {
                          handleEditDocumentFile(idx, event.target.files?.[0] || null);
                          event.target.value = "";
                        }}
                        data-testid={`edit-profile-doc-input-${idx}`}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={isSaving} data-testid="save-profile-btn">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={uploadDocDialog.open}
        onOpenChange={(open) => {
          setUploadDocDialog({ ...uploadDocDialog, open });
          if (!open) setSelectedDocumentFile(null);
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
            <Button variant="outline" onClick={() => setUploadDocDialog({ open: false, document: null })}>Cancel</Button>
            <Button onClick={handleUploadDocument} disabled={!selectedDocumentFile || isSaving} data-testid="upload-doc-btn">
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

const IconInfo = ({ label, value, icon: Icon }) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{value || "N/A"}</span>
    </div>
  </div>
);

const DocumentRow = ({ doc, idx, onUpload }) => (
  <div className={`p-3 rounded-sm flex items-center justify-between ${
    doc.status === "expired" ? "bg-red-500/10 border border-red-500/20" :
    doc.status === "expiring" ? "bg-amber-500/10 border border-amber-500/20" :
    "bg-muted/30"
  }`}>
    <div className="flex items-center gap-3">
      {doc.status === "expired" ? <FileX className="h-5 w-5 text-red-400" /> :
       doc.status === "expiring" ? <FileWarning className="h-5 w-5 text-amber-400" /> :
       <FileCheck className="h-5 w-5 text-emerald-400" />}
      <div>
        <p className="text-sm font-medium">{doc.name}</p>
        <p className={`text-xs ${doc.status === "expired" ? "text-red-400" : doc.status === "expiring" ? "text-amber-400" : "text-muted-foreground"}`}>
          {doc.status === "expired" ? "EXPIRED" : `Expires: ${doc.expiryDate}`}
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
