import { useState, createContext, useContext } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { SupplierDashboard } from "@/pages/SupplierDashboard";
import { BuyerDashboard } from "@/pages/BuyerDashboard";

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

  const renderDashboard = () => {
    switch (currentRole) {
      case "admin":
        return <AdminDashboard />;
      case "supplier":
        return <SupplierDashboard />;
      case "buyer":
        return <BuyerDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole: handleRoleChange }}>
      <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
        <div className="min-h-screen bg-background tactical-grid noise-overlay">
          <DashboardShell>
            {renderDashboard()}
          </DashboardShell>
          <Toaster position="top-right" richColors />
        </div>
      </NavigationContext.Provider>
    </RoleContext.Provider>
  );
}

export default App;
