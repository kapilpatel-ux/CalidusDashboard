import { useState, createContext, useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { DashboardShell } from "@/components/layout/DashboardShell";
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

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
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
  const [currentRole, setCurrentRole] = useState("admin");
  const [activeSection, setActiveSection] = useState("overview");

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    setActiveSection("overview");
  };

  return (
    <BrowserRouter>
      <RoleContext.Provider value={{ currentRole, setCurrentRole: handleRoleChange }}>
        <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
          <div className="min-h-screen bg-background tactical-grid noise-overlay">
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

                <Route
                  path="/buyer"
                  element={
                    currentRole === "buyer"
                      ? <BuyerOverview />
                      : <Navigate to="/" replace />
                  }
                />

                <Route path="/buyer/overview" element={currentRole === "buyer" ? <BuyerOverview /> : <Navigate to="/" replace />} />
                <Route path="/buyer/enquiries" element={currentRole === "buyer" ? <BuyerEnquiries /> : <Navigate to="/" replace />} />
                <Route path="/buyer/ratings" element={currentRole === "buyer" ? <BuyerRatings /> : <Navigate to="/" replace />} />
                <Route path="/buyer/profile" element={currentRole === "buyer" ? <BuyerProfile /> : <Navigate to="/" replace />} />
                <Route path="/buyer/*" element={<Navigate to="/buyer/overview" replace />} />

                <Route
                  path="/supplier"
                  element={currentRole === "supplier" ? <Navigate to="/supplier/overview" replace /> : <Navigate to="/" replace />}
                />
                <Route path="/supplier/overview" element={currentRole === "supplier" ? <SupplierOverview /> : <Navigate to="/" replace />} />
                <Route path="/supplier/companyprofile" element={currentRole === "supplier" ? <SupplierProfile /> : <Navigate to="/" replace />} />
                <Route path="/supplier/productmanagement" element={currentRole === "supplier" ? <SupplierProducts /> : <Navigate to="/" replace />} />
                <Route path="/supplier/enquiries" element={currentRole === "supplier" ? <SupplierEnquiries /> : <Navigate to="/" replace />} />
                <Route path="/supplier/ratings" element={currentRole === "supplier" ? <SupplierRatings /> : <Navigate to="/" replace />} />
                <Route path="/supplier/*" element={<Navigate to="/supplier/overview" replace />} />

                <Route
                  path="*"
                  element={<Navigate to={currentRole === "admin" ? "/admin/overview" : currentRole === "buyer" ? "/buyer/overview" : "/supplier/overview"} replace />}
                />
              </Routes>
            </DashboardShell>
            <Toaster position="top-right" richColors />
          </div>
        </NavigationContext.Provider>
      </RoleContext.Provider>
    </BrowserRouter>
  );
}

export default App;
