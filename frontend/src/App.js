import { useState, createContext, useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthPage } from "@/pages/auth/AuthPage";
import ContactSupplierPage from "@/pages/ContactSupplierPage";
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
  PlatformInsights,
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
} from "@/pages/supplier";

// Role Context
const RoleContext = createContext();
const AuthContext = createContext();

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

  const authValue = {
    ...authState,
    isAuthenticated,
    currentUser: authState.user,
    completeAuth,
    logout,
  };

  const dashboardRoutes = (
    <DashboardShell>
      <Routes>
        <Route
          path="/"
          element={
            currentRole === "admin"
              ? <Navigate to="/admin/overview" replace />
              : currentRole === "buyer"
                ? <Navigate to="/buyer/overview" replace />
                : <Navigate to="/supplier/overview" replace />
          }
        />

        <Route
          path="/admin"
          element={
            currentRole === "admin"
              ? <AdminProvider />
              : <Navigate to="/" replace />
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="suppliermanagement" element={<SupplierManagement />} />
          <Route path="productmanagement" element={<ProductManagement />} />
          <Route path="ratingsmoderation" element={<RatingsModeration />} />
          <Route path="categorymanagement" element={<CategoryManagement />} />
          <Route path="buyermanagement" element={<BuyerManagement />} />
          <Route path="enquirymanagement" element={<EnquiryManagement />} />
          <Route path="notificationmanagement" element={<NotificationManagement />} />
          <Route path="usermanagement" element={<UserManagement />} />
          <Route path="platforminsights" element={<PlatformInsights />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
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
        <Route path="/supplier/*" element={<Navigate to="/supplier/overview" replace />} />

        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="/contact-supplier" element={<ContactSupplierPage />} />
        <Route path="*" element={<Navigate to={currentRole === "admin" ? "/admin/overview" : currentRole === "buyer" ? "/buyer/overview" : "/supplier/overview"} replace />} />
      </Routes>
    </DashboardShell>
  );

  return (
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <RoleContext.Provider value={{ currentRole, setCurrentRole: handleRoleChange }}>
          <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
            {isAuthenticated ? (
              <div className="min-h-screen bg-background tactical-grid noise-overlay">
                {dashboardRoutes}
              </div>
            ) : (
              <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/contact-supplier" element={<ContactSupplierPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
            <Toaster position="top-right" richColors />
          </NavigationContext.Provider>
        </RoleContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;
