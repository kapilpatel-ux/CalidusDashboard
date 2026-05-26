import { useState, useMemo, useCallback, createContext, useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthPage } from "@/pages/auth/AuthPage";
import ContactSupplierPage from "@/pages/ContactSupplierPage";
import { SupplierRegistrationPage } from "@/pages/public/SupplierRegistrationPage";
import { useGetAdminRolesQuery } from "@/store/api/admin/roleApi";

import {
  AdminProvider,
  AdminOverview,
  SupplierManagement,
  ProductManagement,
  RatingsModeration,
  CategoryManagement,
  BuyerManagement,
  EnquiryManagement,
  NotificationManagement,
  UserManagement,
  RoleManagement,
  PermissionManagement,
  PlatformInsights,
  AdminProfile,
} from "@/pages/admin";
import {
  BuyerOverview,
  BuyerEnquiries,
  BuyerRatings,
  BuyerProfile,
} from "@/pages/buyer";
import {
  SupplierOverview,
  SupplierProfile,
  SupplierProducts,
  SupplierEnquiries,
  SupplierRatings,
  SupplierNotificationManagement,
  SupplierCategoryManagement,
} from "@/pages/supplier";

// Role Context
const RoleContext = createContext();
const AuthContext = createContext();
const PermissionsContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionsContext provider");
  }
  return context;
};

// Navigation Context for active section
const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

function App() {
  const [authState, setAuthState] = useState(() => {
    try {
      const token = localStorage.getItem("calidus_token");
      const user = JSON.parse(localStorage.getItem("calidus_user") || "null");
      return token && user ? { token, user } : { token: "", user: null };
    } catch (_) {
      return { token: "", user: null };
    }
  });
  const [currentRole, setCurrentRole] = useState(authState.user?.role || "buyer");
  const [activeSection, setActiveSection] = useState("overview");
  const isAuthenticated = Boolean(authState.token && authState.user);
  const isAdminRole = !["buyer", "supplier"].includes(currentRole);
  const adminLandingPath = currentRole === "admin" ? "/admin/overview" : "/admin/suppliermanagement";
  // Permissions are stored against admin roles (sub_admin/content_manager/custom roles)
  // Platform admin is treated as full access.
  // This is a UI guard; backend endpoints are currently not permission-protected.
  const { data: adminRoles = [] } = useGetAdminRolesQuery(undefined, { skip: !isAdminRole });

  const permissionSet = useMemo(() => {
    if (!isAdminRole) return new Set();
    if (currentRole === "admin") return new Set(["*"]);
    const rolesList = Array.isArray(adminRoles) ? adminRoles : [];
    const match = rolesList.find((r) => r.key === currentRole);
    const perms = Array.isArray(match?.permissions) ? match.permissions : [];
    return new Set(perms);
  }, [adminRoles, currentRole, isAdminRole]);

  const hasPermission = useCallback((key) => {
    if (!isAdminRole) return false;
    if (permissionSet.has("*")) return true;
    return permissionSet.has(key);
  }, [isAdminRole, permissionSet]);

  const adminDefaultPath = useMemo(() => {
    if (currentRole === "admin") return "/admin/overview";
	    const candidates = [
	      ["admin.suppliermanagement", "/admin/suppliermanagement"],
	      ["admin.productmanagement", "/admin/productmanagement"],
	      ["admin.ratingsmoderation", "/admin/ratingsmoderation"],
	      ["admin.categorymanagement", "/admin/categorymanagement"],
	      ["admin.buyermanagement", "/admin/buyermanagement"],
	      ["admin.enquirymanagement", "/admin/enquirymanagement"],
	      ["admin.notificationmanagement", "/admin/notificationmanagement"],
	      ["admin.usermanagement", "/admin/usermanagement"],
	      ["admin.rolemanagement", "/admin/rolemanagement"],
	      ["admin.permissionmanagement", "/admin/permissionmanagement"],
	      ["admin.profile", "/admin/profile"],
	    ];
    for (const [perm, path] of candidates) {
      if (hasPermission(perm)) return path;
    }
    return "/admin/profile";
  }, [currentRole, hasPermission]);

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    setActiveSection("overview");
  };

  const completeAuth = ({ token, user }) => {
    localStorage.setItem("calidus_token", token);
    localStorage.setItem("calidus_user", JSON.stringify(user));
    setAuthState({ token, user });
    setCurrentRole(user.role);
    setActiveSection("overview");
  };

  const logout = () => {
    localStorage.removeItem("calidus_token");
    localStorage.removeItem("calidus_user");
    setAuthState({ token: "", user: null });
    setCurrentRole("buyer");
    setActiveSection("overview");
  };

  const updateCurrentUser = (updates) => {
    setAuthState((current) => {
      const user = { ...current.user, ...updates };
      localStorage.setItem("calidus_user", JSON.stringify(user));
      return { ...current, user };
    });
  };

  const authValue = {
    ...authState,
    isAuthenticated,
    currentUser: authState.user,
    completeAuth,
    updateCurrentUser,
    logout,
  };

  const dashboardRoutes = (
    <DashboardShell>
      <Routes>
        <Route
          path="/"
          element={
            isAdminRole
              ? <Navigate to={adminLandingPath} replace />
              : currentRole === "buyer"
                ? <Navigate to="/buyer/overview" replace />
                : <Navigate to="/supplier/overview" replace />
          }
        />

        <Route
          path="/admin"
          element={
            isAdminRole
              ? <AdminProvider />
              : <Navigate to="/" replace />
          }
        >
          <Route index element={<Navigate to={currentRole === "admin" ? "overview" : adminDefaultPath.replace("/admin/", "")} replace />} />
          <Route
            path="overview"
            element={
              currentRole === "admin"
                ? <AdminOverview />
                : hasPermission("admin.overview")
                  ? <AdminOverview />
                  : <Navigate to={adminDefaultPath} replace />
            }
          />
          <Route path="suppliermanagement" element={hasPermission("admin.suppliermanagement") ? <SupplierManagement /> : <Navigate to={adminDefaultPath} replace />} />
          <Route path="productmanagement" element={hasPermission("admin.productmanagement") ? <ProductManagement /> : <Navigate to={adminDefaultPath} replace />} />
          <Route path="ratingsmoderation" element={hasPermission("admin.ratingsmoderation") ? <RatingsModeration /> : <Navigate to={adminDefaultPath} replace />} />
          <Route path="categorymanagement" element={hasPermission("admin.categorymanagement") ? <CategoryManagement /> : <Navigate to={adminDefaultPath} replace />} />
          <Route path="buyermanagement" element={hasPermission("admin.buyermanagement") ? <BuyerManagement /> : <Navigate to={adminDefaultPath} replace />} />
          <Route path="enquirymanagement" element={hasPermission("admin.enquirymanagement") ? <EnquiryManagement /> : <Navigate to={adminDefaultPath} replace />} />
          <Route path="notificationmanagement" element={hasPermission("admin.notificationmanagement") ? <NotificationManagement /> : <Navigate to={adminDefaultPath} replace />} />
          <Route path="usermanagement" element={hasPermission("admin.usermanagement") ? <UserManagement /> : <Navigate to={adminDefaultPath} replace />} />
          <Route
            path="rolemanagement"
            element={currentRole === "admin" || hasPermission("admin.rolemanagement") ? <RoleManagement /> : <Navigate to={adminDefaultPath} replace />}
          />
          <Route
            path="permissionmanagement"
            element={currentRole === "admin" || hasPermission("admin.permissionmanagement") ? <PermissionManagement /> : <Navigate to={adminDefaultPath} replace />}
          />
          <Route
            path="platforminsights"
            element={currentRole === "admin" || hasPermission("admin.platforminsights") ? <PlatformInsights /> : <Navigate to={adminDefaultPath} replace />}
          />
          <Route path="profile" element={hasPermission("admin.profile") || currentRole === "admin" ? <AdminProfile /> : <Navigate to={adminDefaultPath} replace />} />
          <Route path="*" element={<Navigate to={currentRole === "admin" ? "overview" : adminDefaultPath.replace("/admin/", "")} replace />} />
        </Route>

        <Route path="/buyer" element={currentRole === "buyer" ? <BuyerOverview /> : <Navigate to="/" replace />} />
        <Route path="/buyer/overview" element={currentRole === "buyer" ? <BuyerOverview /> : <Navigate to="/" replace />} />
        <Route path="/buyer/enquiries" element={currentRole === "buyer" ? <BuyerEnquiries /> : <Navigate to="/" replace />} />
        <Route path="/buyer/ratings" element={currentRole === "buyer" ? <BuyerRatings /> : <Navigate to="/" replace />} />
        <Route path="/buyer/profile" element={currentRole === "buyer" ? <BuyerProfile /> : <Navigate to="/" replace />} />
        <Route path="/buyer/*" element={<Navigate to="/buyer/overview" replace />} />

        <Route path="/supplier" element={currentRole === "supplier" ? <Navigate to="/supplier/overview" replace /> : <Navigate to="/" replace />} />
        <Route path="/supplier/overview" element={currentRole === "supplier" ? <SupplierOverview /> : <Navigate to="/" replace />} />
        <Route path="/supplier/companyprofile" element={currentRole === "supplier" ? <SupplierProfile /> : <Navigate to="/" replace />} />
        <Route path="/supplier/productmanagement" element={currentRole === "supplier" ? <SupplierProducts /> : <Navigate to="/" replace />} />
        <Route path="/supplier/enquiries" element={currentRole === "supplier" ? <SupplierEnquiries /> : <Navigate to="/" replace />} />
        <Route path="/supplier/ratings" element={currentRole === "supplier" ? <SupplierRatings /> : <Navigate to="/" replace />} />
        <Route path="/supplier/notificationmanagement" element={currentRole === "supplier" ? <SupplierNotificationManagement /> : <Navigate to="/" replace />} />
        <Route path="/supplier/categorymanagement" element={currentRole === "supplier" ? <SupplierCategoryManagement /> : <Navigate to="/" replace />} />
        <Route path="/supplier/*" element={<Navigate to="/supplier/overview" replace />} />

        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to={isAdminRole ? adminLandingPath : currentRole === "buyer" ? "/buyer/overview" : "/supplier/overview"} replace />} />
      </Routes>
    </DashboardShell>
  );

  return (
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <RoleContext.Provider value={{ currentRole, setCurrentRole: handleRoleChange }}>
          <PermissionsContext.Provider value={{ permissionSet, hasPermission }}>
            <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
            {isAuthenticated ? (
              <Routes>
                <Route path="/contact-supplier" element={<ContactSupplierPage />} />
                <Route
                  path="/*"
                  element={
                    <div className="min-h-screen bg-background tactical-grid noise-overlay dashboard-bg-background">
                      {dashboardRoutes}
                    </div>
                  }
                />
              </Routes>
            ) : (
              <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/contact-supplier" element={<ContactSupplierPage />} />
                <Route path="/supplier-registration" element={<SupplierRegistrationPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
            <Toaster position="top-right" richColors />
            </NavigationContext.Provider>
          </PermissionsContext.Provider>
        </RoleContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;
