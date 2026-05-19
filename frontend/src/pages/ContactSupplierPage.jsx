import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/images/calidusheader.png";
import { useGetSuppliersQuery } from "@/store/api/admin/supplierApi";
import { useCreateContactSupplierMutation } from "@/store/api/contactSupplierApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COUNTRIES } from "@/data/countries";

const productOptions = [
  { id: "prd003", name: "Tactical Communication Module TCM-200" },
  { id: "prd002", name: "Ballistic Armor Plates Level IV" },
  { id: "prd008", name: "Composite Armor Panel CAP-III" },
  { id: "prd004", name: "Radar Signal Processing Unit RSP-500" },
];

const initialForm = {
  fullName: "",
  company: "",
  buyerCountry: "",
  supplierCountry: "",
  supplierId: "",
  email: "",
  productId: "",
};

export default function ContactSupplierPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [createContactSupplier, { isLoading }] = useCreateContactSupplierMutation();
  const {
    data: suppliers = [],
    isLoading: isSuppliersLoading,
    isError: isSuppliersError,
  } = useGetSuppliersQuery();

  const selectedProduct = productOptions.find((product) => product.id === form.productId);
  const supplierCountry = String(form.supplierCountry || "").trim();
  const nonSuspendedSuppliers = suppliers.filter((supplier) => supplier.status !== "suspended");
  const supplierCountryOptions = Array.from(
    new Set(
      nonSuspendedSuppliers
        .map((s) => String(s?.country || "").trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const normalize = (value) => String(value || "").trim().toLowerCase();
  const availableSuppliers = nonSuspendedSuppliers.filter((supplier) => {
    if (!supplierCountry || supplierCountry === "all") return true;
    return normalize(supplier.country) === normalize(supplierCountry);
  });
  const selectedSupplier = availableSuppliers.find((supplier) => supplier.id === form.supplierId);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const company = form.company.trim();
    const buyerCountry = String(form.buyerCountry || "").trim();

    if (!fullName || !company || !email || !buyerCountry || !selectedSupplier || !selectedProduct) {
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
        country: buyerCountry,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
      }).unwrap();

      if (created.userAlreadyExisted) {
        toast.warning("User already existed with this email");
      } else if (created.userCreated) {
        toast.success("User created and enquiry sent successfully");
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <Field label="Country">
                <Select
                  value={form.buyerCountry}
                  onValueChange={(value) => updateField("buyerCountry", value)}
                  required
                >
                  <SelectTrigger className="h-[51px] border-[#29292E] bg-[#070709] text-[#9D9DA5]">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-72">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <div className="rounded-sm border border-[#26262B] bg-[#0B0D10] p-6 space-y-6">
            <p className="font-['Barlow_Condensed'] text-[20px] font-semibold uppercase tracking-wide text-white">
              Supplier details
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Supplier country">
                <Select
                  value={form.supplierCountry}
                  onValueChange={(value) => {
                    updateField("supplierCountry", value);
                    updateField("supplierId", "");
                  }}
                >
                  <SelectTrigger className="h-[51px] border-[#29292E] bg-[#070709] text-[#9D9DA5]">
                    <SelectValue placeholder="Select supplier country" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-72">
                      <SelectItem value="all">All Countries</SelectItem>
                      {supplierCountryOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Supplier company">
                <Select
                  value={form.supplierId}
                  onValueChange={(value) => updateField("supplierId", value)}
                  disabled={isSuppliersLoading || isSuppliersError}
                  required
                >
                  <SelectTrigger className="h-[51px] border-[#29292E] bg-[#070709] text-[#9D9DA5]">
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
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Product">
              <Select value={form.productId} onValueChange={(value) => updateField("productId", value)} required>
                <SelectTrigger className="h-[51px] border-[#29292E] bg-[#070709] text-[#9D9DA5]">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {productOptions.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
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
      <Label className="text-[18px] font-medium uppercase leading-[110.6%] text-[#A1A1AA]">
        {label}
      </Label>
      {children}
    </div>
  );
}
