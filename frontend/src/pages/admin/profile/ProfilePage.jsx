import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, Edit, Mail, Phone, Shield, User, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/App";
import { useUpdateUserMutation } from "@/store/api/admin/userApi";

const roleLabels = {
  admin: "Platform Administrator",
  sub_admin: "Sub Administrator",
  content_manager: "Content Manager",
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AD";

export const AdminProfile = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [editProfileDialog, setEditProfileDialog] = useState(false);

  useEffect(() => {
    setProfileForm({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
    });
  }, [currentUser]);

  const roleLabel = roleLabels[currentUser?.role] || currentUser?.role || "Administrator";
  const joinedDate = currentUser?.createdAt || currentUser?.joinDate;
  const adminDetails = useMemo(
    () => [
      { label: "Full Name", value: currentUser?.name || "N/A", icon: User },
      { label: "Email", value: currentUser?.email || "N/A", icon: Mail },
      { label: "Phone", value: currentUser?.phone || "N/A", icon: Phone },
      { label: "Role", value: roleLabel, icon: Shield },
      { label: "User ID", value: currentUser?.id || "N/A", icon: UserCog },
      { label: "Member Since", value: formatDate(joinedDate), icon: Calendar },
    ],
    [currentUser, joinedDate, roleLabel],
  );

  const openEditProfile = () => {
    setProfileForm({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
    });
    setEditProfileDialog(true);
  };

  const handleSaveProfile = async () => {
    const name = profileForm.name.trim();
    const email = profileForm.email.trim();
    const phone = profileForm.phone.trim();

    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      let savedUser = { ...currentUser, name, email, phone };

      if (currentUser?.id) {
        const updated = await updateUser({
          id: currentUser.id,
          payload: { name, email },
        }).unwrap();
        savedUser = { ...savedUser, ...updated, phone };
      }

      updateCurrentUser(savedUser);
      toast.success("Admin profile updated successfully");
      setEditProfileDialog(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update admin profile");
    }
  };

  return (
    <>
      <div className="space-y-6" data-testid="admin-profile">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Admin Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your administrator account details</p>
          </div>
          <Button onClick={openEditProfile} className="gap-2" data-testid="edit-admin-profile-btn">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="space-y-6">
          <div className="dashboard-card">
            <div className="dashboard-card-content">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-primary/15 text-2xl font-bold text-primary">
                    {getInitials(currentUser?.name)}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Signed in as</p>
                    <h2 className="mt-1 text-2xl font-semibold">{currentUser?.name || "Admin User"}</h2>
                    <p className="text-sm text-muted-foreground">{roleLabel}</p>
                  </div>
                </div>
                <StatusBadge status={currentUser?.status || "active"} />
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="dashboard-card-title">Account Details</h3>
            </div>
            <div className="dashboard-card-content">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {adminDetails.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-sm border border-border bg-black/20 p-4">
                    <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="min-w-0 truncate font-medium">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editProfileDialog} onOpenChange={setEditProfileDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Edit Admin Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input
                value={profileForm.name}
                onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                className="bg-black/20 mt-1"
                data-testid="edit-admin-name"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
                className="bg-black/20 mt-1"
                data-testid="edit-admin-email"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
              <Input
                value={profileForm.phone}
                onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
                className="bg-black/20 mt-1"
                data-testid="edit-admin-phone"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
              <Input value={roleLabel} disabled className="bg-black/20 mt-1" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileDialog(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving || !profileForm.name.trim() || !profileForm.email.trim()}
              data-testid="save-admin-profile-btn"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
