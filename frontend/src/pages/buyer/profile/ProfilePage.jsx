import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Building2, Edit, Mail, MapPin, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/App";
import { getCountryNameFromDialCode, validatePhoneNumber } from "@/lib/phoneValidation";

import { currentBuyer } from "@/data/mockData";
import {
  useGetBuyerProfileQuery,
  useUpdateBuyerProfileMutation,
} from "@/store/api/buyer/buyerProfileApi";

export const BuyerProfile = () => {
  const { currentUser } = useAuth();
  const buyerId = currentUser?.profileId || currentBuyer.id;
  const { data: buyer = {}, isLoading, error } = useGetBuyerProfileQuery(buyerId);
  const [updateBuyerProfile, { isLoading: isSaving }] = useUpdateBuyerProfileMutation();
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  if (isLoading) return <p>Loading buyer profile...</p>;
  if (error) return <p>Failed to load buyer profile.</p>;

  const displayCountry = getCountryNameFromDialCode(buyer.phone) || buyer.country;

  const openEditProfile = () => {
    setProfileForm({
      ...buyer,
      country: displayCountry,
    });
    setEditProfileDialog(true);
  };

  const handleSaveProfile = async () => {

    const phone = String(profileForm.phone || "").trim();
    const country = String(profileForm.country || getCountryNameFromDialCode(phone) || "").trim();

    const phoneError = validatePhoneNumber(phone, country);
    if (phoneError) {
      toast.error(phoneError);
      return;
    }

    if (!String(profileForm.name || "").trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!String(profileForm.company || "").trim()) {
      toast.error("Company is required");
      return;
    }
   
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(profileForm.email || "").trim())) {
      toast.error("Enter a valid email address");
      return;
    }

    if (!country) {
      toast.error("Please select a valid mobile country code");
      return;
    }

    try {
      await updateBuyerProfile({ 
        buyerId,
        payload: {
          name: profileForm.name,
          company: profileForm.company,
          email: profileForm.email,
          country,
          phone: profileForm.phone,
        },
      }).unwrap();
      toast.success("Profile updated successfully");
      setEditProfileDialog(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  return (
    <>
      <div className="space-y-6" data-testid="buyer-profile">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Profile Management</h1>
            <p className="text-sm text-muted-foreground">Update your contact information</p>
          </div>
          <Button onClick={openEditProfile} className="gap-2" data-testid="edit-buyer-profile-btn">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Personal Information</h3>
              </div>
              <div className="dashboard-card-content space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Full Name</p>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{buyer.name}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Company</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{buyer.company}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{buyer.email}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{buyer.phone || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Country</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{displayCountry}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Account Stats</h3>
              </div>
              <div className="dashboard-card-content space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Enquiries</span>
                  <span className="text-sm font-medium">{buyer.enquiriesSent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ratings Submitted</span>
                  <span className="text-sm font-medium">{buyer.ratingsSubmitted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">{buyer.joinDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={buyer.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editProfileDialog} onOpenChange={setEditProfileDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input
                value={profileForm.name || ""}
                onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                className="bg-black/20 mt-1"
                data-testid="edit-buyer-name"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Company</Label>
              <Input
                value={profileForm.company || ""}
                onChange={(event) => setProfileForm({ ...profileForm, company: event.target.value })}
                className="bg-black/20 mt-1"
                data-testid="edit-buyer-company"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                value={profileForm.email || ""}
                onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
                className="bg-black/20 mt-1"
                data-testid="edit-buyer-email"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
              <PhoneInput
                country={"us"}
                value={profileForm.phone || ""}
                onChange={(value, data) => {
                  const dialCode = data?.dialCode ? `+${data.dialCode}` : "";
                  const country = String(getCountryNameFromDialCode(dialCode) || data?.name || "").trim();
                  setProfileForm({
                    ...profileForm,
                    phone: value,
                    ...(country ? { country } : {}),
                  });
                }}
                inputClass="!w-full !h-[40px] !bg-black/20 !text-white !border-[#2a2a2a]"
                buttonClass="!bg-black/20 !border-[#2a2a2a]"
                dropdownClass="!bg-[#070709] !text-white [&_.country:hover]:!bg-[#151518] [&_.country.highlight]:!bg-[#151518]"
              />
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
    </>
  );
};
