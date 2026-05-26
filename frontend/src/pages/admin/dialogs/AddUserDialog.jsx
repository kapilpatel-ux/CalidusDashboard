import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { useGetAdminRolesQuery } from "@/store/api/admin/roleApi";

export const AddUserDialog = ({
  open,
  setOpen,
  newUser,
  setNewUser,
  onAddUser,
  isAdding = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { data: roles = [], isLoading: isRolesLoading } = useGetAdminRolesQuery();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">
            Add User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Name
            </Label>
            <Input
              value={newUser.name || ""}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
              className="bg-black/20 mt-1"
              data-testid="add-user-name"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <Input
              type="email"
              value={newUser.email || ""}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              className="bg-black/20 mt-1"
              data-testid="add-user-email"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Mobile Number
            </Label>
            <PhoneInput
              country={"us"}
              value={newUser.phone || ""}
              onChange={(value) => setNewUser((prev) => ({ ...prev, phone: value }))}
              inputClass="!w-full !h-[40px] !bg-black/20 !text-white !border-[#2a2a2a]"
              buttonClass="!bg-black/20 !border-[#2a2a2a]"
              dropdownClass="!bg-[#070709] !text-white [&_.country:hover]:!bg-[#151518] [&_.country.highlight]:!bg-[#151518]"
              containerClass="mt-1 phone-input-container"
              data-testid="add-user-phone"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={newUser.password || ""}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, password: e.target.value }))
                }
                className="bg-black/20 pr-10"
                data-testid="add-user-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                data-testid="toggle-add-user-password"
                disabled={isAdding}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Role
            </Label>
            <Select
              value={newUser.role || ""}
              onValueChange={(role) => setNewUser((prev) => ({ ...prev, role }))}
              disabled={isAdding || isRolesLoading}
            >
              <SelectTrigger className="bg-black/20 mt-1" data-testid="add-user-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(roles) ? roles : []).map((role) => (
                  <SelectItem key={role.key} value={role.key}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isAdding}>
            Cancel
          </Button>
          <Button
            onClick={onAddUser}
            disabled={
              isAdding ||
              !String(newUser.name || "").trim() ||
              !String(newUser.email || "").trim() ||
              !String(newUser.phone || "").trim() ||
              !String(newUser.password || "").trim() ||
              !String(newUser.role || "").trim()
            }
            data-testid="add-user-submit-btn"
          >
            {isAdding ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
