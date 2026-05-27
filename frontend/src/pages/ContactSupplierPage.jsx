import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logo from "@/assets/images/calidusheader.png";
import { useGetProductsQuery } from "@/store/api/admin/productApi";
import { useGetSuppliersQuery } from "@/store/api/admin/supplierApi";
import { useCreateContactSupplierMutation } from "@/store/api/contactSupplierApi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCountryNameFromDialCode, validatePhoneNumber } from "@/lib/phoneValidation";
import { copyCredentialsText, downloadCredentialsJson } from "@/lib/credentialDownload";

const initialForm = {
  fullName: "",
  company: "",
  buyerCountry: getCountryNameFromDialCode("+1") || "United States",
  phoneCountryCode: "+1",
  supplierId: "",
  email: "",
  phone: "",
  productId: "",
};

const compactSelectTriggerClass =
  "h-[51px] border-[#29292E] bg-[#070709] text-sm text-[#9D9DA5] [&>span]:truncate [&>span]:text-sm";
  // "h-[44px] border-[#29292E] bg-[#070709] text-[11px] text-[#9D9DA5] [&>span]:truncate [&>span]:text-[11px]";
  
export default function ContactSupplierPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [credentialDialog, setCredentialDialog] = useState({ open: false, credentials: null });
  const [createContactSupplier, { isLoading }] = useCreateContactSupplierMutation();
  const {
    data: suppliers = [],
    isLoading: isSuppliersLoading,
    isError: isSuppliersError,
  } = useGetSuppliersQuery();
  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useGetProductsQuery();

  const nonSuspendedSuppliers = suppliers.filter((supplier) => supplier.status !== "suspended");
  const availableSuppliers = nonSuspendedSuppliers;
  const selectedSupplier = availableSuppliers.find((supplier) => supplier.id === form.supplierId);
  const supplierProducts = selectedSupplier
    ? products.filter((product) => product.supplierId === selectedSupplier.id && product.status === "approved")
    : [];
  const selectedProduct = supplierProducts.find((product) => product.id === form.productId);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const company = form.company.trim();
    const buyerCountry = String(form.buyerCountry || getCountryNameFromDialCode(form.phoneCountryCode) || "").trim();

    const phone = String(form.phone || "").trim();

    const phoneError = validatePhoneNumber(phone, buyerCountry);
    if (phoneError) {
      toast.error(phoneError);
      return;
    }
    
    if (!buyerCountry) {
      toast.error("Please select a valid mobile country code");
      return;
    }

    if (!fullName || !company || !email || !selectedSupplier || !selectedProduct) {
      toast.error("Please complete all fields");
      return;
    }

    try {
      const created = await createContactSupplier({
        fullName,
        company,
        supplierId: selectedSupplier.id,
        supplierCompany: selectedSupplier.name,
        email,
        phone,
        country: buyerCountry,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
      }).unwrap();

      if (created.userAlreadyExisted) {
        toast.warning("User already existed with this email");
      } else if (created.userCreated) {
        toast.success("User created and enquiry sent successfully");
        if (created?.credentials?.email && created?.credentials?.password) {
          setCredentialDialog({ open: true, credentials: created.credentials });
        }
      } else {
        toast.success("Enquiry sent successfully");
      }
      setForm(initialForm);
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.detail || "Unable to send enquiry");
    }
  };

  return (

    <div className="min-h-screen bg-background tactical-grid noise-overlay p-4">
      <Dialog
        open={credentialDialog.open}
        onOpenChange={(open) => {
          if (!open) setCredentialDialog({ open: false, credentials: null });
        }}
      >
        <DialogContent className="border-[#29292E] bg-[#101214] text-white">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
              Save Your Login Details
            </DialogTitle>
            <DialogDescription>
              Please copy these credentials now. They will disappear when you close this popup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-sm border border-[#29292E] bg-black/20 p-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#9D9DA5]">Email</p>
              <p className="mt-1 font-mono break-all">{credentialDialog.credentials?.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#9D9DA5]">Password</p>
              <p className="mt-1 font-mono break-all">{credentialDialog.credentials?.password}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-[#29292E] bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() =>
                downloadCredentialsJson(
                  credentialDialog.credentials,
                  "calidus-buyer-credentials.json",
                )
              }
            >
              Download
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
      <header className="fixed left-0 top-0 z-40 flex w-full items-center border-b border-[#26262B] bg-[#111417]/95 px-4 py-3 shadow-sm shadow-black/20 backdrop-blur sm:px-8">
        <img src={logo} alt="Calidus" className="h-10 w-36 object-contain" />
      </header>

      <div className="relative mx-auto mt-24 w-full max-w-[734px] rounded-[5px] border-2 border-[#26262B] bg-[#101214] p-[50px]">
        <button type="button" onClick={() => navigate(-1)} className="absolute right-[50px] top-[50px] text-white">
          <X size={24} />
        </button>

        <div className="pr-12">
          <h1 className="font-['Barlow_Condensed'] text-[30px] font-semibold uppercase leading-none text-white">
            Contact supplier
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-[38px] space-y-[30px]">
          <div className="rounded-sm border border-[#26262B] bg-[#0B0D10] p-6 space-y-6">
            <p className="font-['Barlow_Condensed'] text-[20px] font-semibold uppercase tracking-wide text-white">
              Create account
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Full name">
                <Input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  required
                  placeholder="Enter full name"
                  className="h-[51px] border-[#29292E] bg-[#070709] text-white placeholder:text-[#9D9DA5]"
                />
              </Field>

              <Field label="Company">
                <Input
                  value={form.company}
                  onChange={(event) => updateField("company", event.target.value)}
                  required
                  placeholder="Enter company name"
                  className="h-[51px] border-[#29292E] bg-[#070709] text-white placeholder:text-[#9D9DA5]"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Email">
                <Input
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                  type="email"
                  placeholder="Enter your email"
                  className="h-[51px] border-[#29292E] bg-[#070709] text-white placeholder:text-[#9D9DA5]"
                />
              </Field>

              <Field label="Mobile Number">
                <PhoneInput
                  country={"us"}
                  value={form.phone}
                  onChange={(value, data) => {
                    updateField("phone", value);
                    const dialCode = data?.dialCode ? `+${data.dialCode}` : "";
                    const inferredCountry = String(getCountryNameFromDialCode(dialCode) || data?.name || "").trim();
                    if (dialCode) updateField("phoneCountryCode", dialCode);
                    if (inferredCountry) updateField("buyerCountry", inferredCountry);
                  }}
                  inputClass="!w-full !h-[51px] !bg-[#070709] !text-white !border-[#29292E]"
                  // buttonClass="!bg-[#070709] !border-[#29292E]"
                  buttonClass="!bg-[#070709] !border-[#29292E] hover:!bg-[#070709] focus:!bg-[#070709]"
                  dropdownClass="!bg-[#070709] !text-white [&_.country:hover]:!bg-[#151518] [&_.country.highlight]:!bg-[#151518]"
                  containerClass="phone-input-container"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-sm border border-[#26262B] bg-[#0B0D10] p-6 space-y-6">
            <p className="font-['Barlow_Condensed'] text-[20px] font-semibold uppercase tracking-wide text-white">
              Supplier details
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Supplier company">
	                <Select
	                  value={form.supplierId}
	                  onValueChange={(value) => {
	                    updateField("supplierId", value);
	                    updateField("productId", "");
	                  }}
	                  disabled={isSuppliersLoading || isSuppliersError}
                  required
                >
                  <SelectTrigger className={compactSelectTriggerClass}>
                    <SelectValue
                      placeholder={
                        isSuppliersLoading
                          ? "Loading suppliers..."
                          : isSuppliersError
                            ? "Unable to load suppliers"
                            : availableSuppliers.length === 0
                              ? "No suppliers found"
                              : "Select supplier company"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-72">
                      {availableSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id} className="text-sm">
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </Field>
            </div>

	            <Field label="Product">
	              <Select
	                value={form.productId}
	                onValueChange={(value) => updateField("productId", value)}
	                disabled={!selectedSupplier || isProductsLoading || isProductsError || supplierProducts.length === 0}
	                required
	              >
	                <SelectTrigger className={compactSelectTriggerClass}>
	                  <SelectValue
	                    placeholder={
	                      !selectedSupplier
	                        ? "Select supplier first"
	                        : isProductsLoading
	                          ? "Loading products..."
	                          : isProductsError
	                            ? "Unable to load products"
	                            : supplierProducts.length === 0
	                              ? "No approved products found"
	                              : "Select product"
	                    }
	                  />
	                </SelectTrigger>
	                <SelectContent>
	                  <ScrollArea className="h-72">
	                    {supplierProducts.map((product) => (
	                      <SelectItem key={product.id} value={product.id} className="text-sm">
	                        {product.name}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex justify-end gap-5 pt-2">
            <Button type="button" onClick={() => navigate(-1)} variant="outline" className="h-[50px] w-[144px] border-[#29292E] bg-transparent text-[18px] font-semibold text-white hover:bg-[#070709]">
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading} className="h-[50px] w-[144px] bg-[#3C83F6] text-[18px] font-semibold text-white hover:bg-[#2563eb]">
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-[15px]">
      <Label className="text-[15px] font-medium uppercase leading-[110.6%] text-[#A1A1AA]">
        {label}
      </Label>
      {children}
    </div>
  );
}
