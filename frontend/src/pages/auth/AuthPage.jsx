import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Building2, Lock, Mail, Phone, Shield, User, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@/assets/images/calidusheader.png";
import { useAuth } from "@/App";
import { useLoginMutation, useSignupMutation } from "@/store/api/auth/authApi";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "buyer",
  company: "",
  country: "",
  phone: "",
  supplierType: "OEM",
};

const roleIcons = {
  admin: Shield,
  supplier: Building2,
  buyer: UserCircle,
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, completeAuth } = useAuth();
  // const [mode, setMode] = useState(location.pathname.includes("signup") ? "signup" : "login");
  const [mode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [signup, { isLoading: isSigningUp }] = useSignupMutation();
  const isSignup = mode === "signup";
  const RoleIcon = roleIcons[form.role];

  const targetPath = useMemo(() => {
    if (form.role === "admin") return "/admin/overview";
    if (form.role === "supplier") return "/supplier/overview";
    return "/buyer/overview";
  }, [form.role]);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleAuthSuccess = (result) => {
    completeAuth(result);
    toast.success(isSignup ? "Account created successfully" : "Logged in successfully");
    const role = result?.user?.role || form.role;
    navigate(role === "admin" ? "/admin/overview" : role === "supplier" ? "/supplier/overview" : "/buyer/overview", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = isSignup
        ? form
        : { email: form.email, password: form.password };
      const result = await (isSignup ? signup(payload) : login(payload)).unwrap();
      handleAuthSuccess(result);
    } catch (error) {
      toast.error(error?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-background tactical-grid noise-overlay flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] border border-border bg-card/60 backdrop-blur-md">
        <div className="hidden lg:flex flex-col justify-between border-r border-border p-8">
          <div>
            <img src={logo} alt="Calidus" className="h-10 w-36 object-contain mb-10" />
            {/* <p className="data-label mb-3">Secure Access Console</p> */}
            <h1 className="font-['Barlow_Condensed'] text-5xl font-bold uppercase tracking-wide leading-none">
              Login To Calidus Dashboard
            </h1>
            {/* <p className="mt-4 text-sm text-muted-foreground leading-6">
              Sign in to manage supplier approvals, buyer enquiries, product listings, and platform operations from one role-aware workspace.
            </p> */}
          </div>

          {/* <div className="grid grid-cols-3 gap-3">
            {["admin", "supplier", "buyer"].map((role) => {
              const Icon = roleIcons[role];
              return (
                <div key={role} className="border border-border bg-black/20 p-3">
                  <Icon className="h-4 w-4 text-primary mb-3" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{role}</p>
                </div>
              );
            })}
          </div> */}
        </div>

        <div className="p-6 sm:p-8">
          <div className="lg:hidden mb-8">
            <img src={logo} alt="Calidus" className="h-9 w-32 object-contain" />
          </div>

          {/* <Tabs value={mode} onValueChange={setMode}> */}
          <Tabs value={mode}>
            {/* <TabsList className="grid w-full grid-cols-2 bg-black/20">
              <TabsTrigger value="login" data-testid="auth-login-tab">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="auth-signup-tab">Signup</TabsTrigger>
            </TabsList> */}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <p className="data-label mb-2">{isSignup ? "Create Account" : "Welcome Back"}</p>
                <h2 className="font-['Barlow_Condensed'] text-3xl font-bold uppercase tracking-wide">
                  {isSignup ? "Register Access" : "Login"}
                </h2>
              </div>

              {/* <TabsContent value="signup" className="mt-0 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field icon={User} label="Full Name">
                    <Input value={form.name} onChange={(event) => updateForm("name", event.target.value)} className="bg-black/20" required data-testid="signup-name" />
                  </Field>
                  <Field icon={RoleIcon} label="Role">
                    <Select value={form.role} onValueChange={(value) => updateForm("role", value)}>
                      <SelectTrigger className="bg-black/20" data-testid="signup-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field icon={Building2} label={form.role === "supplier" ? "Company Name" : "Company"}>
                    <Input value={form.company} onChange={(event) => updateForm("company", event.target.value)} className="bg-black/20" data-testid="signup-company" />
                  </Field>
                  <Field icon={Building2} label="Country">
                    <Input value={form.country} onChange={(event) => updateForm("country", event.target.value)} className="bg-black/20" data-testid="signup-country" />
                  </Field>
                </div>

                <Field icon={Phone} label="Phone">
                  <Input value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} className="bg-black/20" data-testid="signup-phone" />
                </Field>

                {form.role === "supplier" && (
                  <Field icon={Shield} label="Supplier Type">
                    <Select value={form.supplierType} onValueChange={(value) => updateForm("supplierType", value)}>
                      <SelectTrigger className="bg-black/20" data-testid="signup-supplier-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OEM">OEM</SelectItem>
                        <SelectItem value="Tier 1">Tier 1</SelectItem>
                        <SelectItem value="Tier 2">Tier 2</SelectItem>
                        <SelectItem value="Distributor">Distributor</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </TabsContent> */}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={Mail} label="Email">
                  <Input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} className="bg-black/20" required data-testid="auth-email" />
                </Field>
                <Field icon={Lock} label="Password">
                  <Input type="password" value={form.password} onChange={(event) => updateForm("password", event.target.value)} className="bg-black/20" required minLength={isSignup ? 6 : 1} data-testid="auth-password" />
                </Field>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isLoggingIn || isSigningUp} data-testid="auth-submit">
                <Lock className="h-4 w-4" />
                {isSignup ? (isSigningUp ? "Creating..." : "Create Account") : (isLoggingIn ? "Signing in..." : "Login")}
              </Button>

              {/* <p className="text-xs text-muted-foreground">
                {isSignup ? "After signup, your selected role controls dashboard access." : `Successful login redirects to ${targetPath}.`}
              </p> */}
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, children }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Label>
    {children}
  </div>
);
