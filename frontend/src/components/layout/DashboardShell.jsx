import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, useRole, useNavigation } from "@/App";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/images/calidusheader.png";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Bell, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  Shield,
  LayoutDashboard,
  Users,
  Package,
  Star,
  FolderTree,
  UserCircle,
  BarChart3,
  Building2,
  Inbox,
  ChevronRight,
  Menu,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import { notifications, messages, supplierNotifications } from "@/data/mockData";

// Navigation items for each role
const navigationConfig = {
  admin: [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/admin/overview" },
    { id: "suppliermanagement", label: "Supplier Management", icon: Building2, path: "/admin/suppliermanagement" },
    { id: "productmanagement", label: "Product Management", icon: Package, path: "/admin/productmanagement" },
    { id: "ratingsmoderation", label: "Ratings Moderation", icon: Star, path: "/admin/ratingsmoderation" },
    { id: "categorymanagement", label: "Category Management", icon: FolderTree, path: "/admin/categorymanagement" },
    { id: "buyermanagement", label: "Buyer Management", icon: Users, path: "/admin/buyermanagement" },
    { id: "enquirymanagement", label: "Enquiry Management", icon: Inbox, path: "/admin/enquirymanagement" },
    { id: "notificationmanagement", label: "Notification Management", icon: Bell, path: "/admin/notificationmanagement" },
    { id: "usermanagement", label: "User Management", icon: Shield, path: "/admin/usermanagement" },
    { id: "platforminsights", label: "Platform Insights", icon: BarChart3, path: "/admin/platforminsights" },
  ],
  sub_admin: [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/admin/overview" },
    { id: "suppliermanagement", label: "Supplier Management", icon: Building2, path: "/admin/suppliermanagement" },
    { id: "productmanagement", label: "Product Management", icon: Package, path: "/admin/productmanagement" },
    { id: "ratingsmoderation", label: "Ratings Moderation", icon: Star, path: "/admin/ratingsmoderation" },
    { id: "categorymanagement", label: "Category Management", icon: FolderTree, path: "/admin/categorymanagement" },
    { id: "buyermanagement", label: "Buyer Management", icon: Users, path: "/admin/buyermanagement" },
    { id: "enquirymanagement", label: "Enquiry Management", icon: Inbox, path: "/admin/enquirymanagement" },
    { id: "notificationmanagement", label: "Notification Management", icon: Bell, path: "/admin/notificationmanagement" },
    { id: "usermanagement", label: "User Management", icon: Shield, path: "/admin/usermanagement" },
    { id: "platforminsights", label: "Platform Insights", icon: BarChart3, path: "/admin/platforminsights" },
  ],
  content_manager: [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/admin/overview" },
    { id: "suppliermanagement", label: "Supplier Management", icon: Building2, path: "/admin/suppliermanagement" },
    { id: "productmanagement", label: "Product Management", icon: Package, path: "/admin/productmanagement" },
    { id: "ratingsmoderation", label: "Ratings Moderation", icon: Star, path: "/admin/ratingsmoderation" },
    { id: "categorymanagement", label: "Category Management", icon: FolderTree, path: "/admin/categorymanagement" },
    { id: "buyermanagement", label: "Buyer Management", icon: Users, path: "/admin/buyermanagement" },
    { id: "enquirymanagement", label: "Enquiry Management", icon: Inbox, path: "/admin/enquirymanagement" },
    { id: "notificationmanagement", label: "Notification Management", icon: Bell, path: "/admin/notificationmanagement" },
    { id: "usermanagement", label: "User Management", icon: Shield, path: "/admin/usermanagement" },
    { id: "platforminsights", label: "Platform Insights", icon: BarChart3, path: "/admin/platforminsights" },
  ],
  supplier: [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/supplier/overview" },
    { id: "profile", label: "Company Profile", icon: Building2, path: "/supplier/companyprofile" },
    { id: "products", label: "Product Management", icon: Package, path: "/supplier/productmanagement" },
    { id: "enquiries", label: "Enquiries", icon: Inbox, path: "/supplier/enquiries" },
    { id: "ratings", label: "Ratings & Reviews", icon: Star, path: "/supplier/ratings" },
    { id: "notificationmanagement", label: "Notification Management", icon: Bell, path: "/supplier/notificationmanagement" },
  ],
  buyer: [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/buyer/overview" },
    // { id: "enquiries", label: "My Enquiries", icon: Inbox, path: "/buyer/enquiries" },
    { id: "ratings", label: "Ratings", icon: Star, path: "/buyer/ratings" },
    { id: "profile", label: "Profile Management", icon: UserCircle, path: "/buyer/profile" },
  ],
};

const adminLegacyLinkMap = {
  overview: "overview",
  suppliers: "suppliermanagement",
  suppliermanagement: "suppliermanagement",
  products: "productmanagement",
  productmanagement: "productmanagement",
  ratings: "ratingsmoderation",
  ratingsmoderation: "ratingsmoderation",
  categories: "categorymanagement",
  categorymanagement: "categorymanagement",
  buyers: "buyermanagement",
  buyermanagement: "buyermanagement",
  enquiries: "enquirymanagement",
  enquirymanagement: "enquirymanagement",
  notifications: "notificationmanagement",
  notificationmanagement: "notificationmanagement",
  users: "usermanagement",
  usermanagement: "usermanagement",
  analytics: "platforminsights",
  platforminsights: "platforminsights",
};

const adminPathBySection = navigationConfig.admin.reduce((acc, item) => {
  acc[item.id] = item.path;
  return acc;
}, {});

const buyerPathBySection = navigationConfig.buyer.reduce((acc, item) => {
  acc[item.id] = item.path;
  return acc;
}, {});

const supplierPathBySection = navigationConfig.supplier.reduce((acc, item) => {
  acc[item.id] = item.path;
  return acc;
}, {});

const supplierRouteSectionMap = {
  overview: "overview",
  companyprofile: "profile",
  productmanagement: "products",
  enquiries: "enquiries",
  ratings: "ratings",
  notificationmanagement: "notificationmanagement",
};

const roleLabels = {
  admin: "Platform Administrator",
  sub_admin: "Sub Administrator",
  content_manager: "Content Manager",
  supplier: "Orion Defense Systems",
  buyer: "James Mitchell",
};

const roleIcons = {
  admin: Shield,
  sub_admin: Shield,
  content_manager: Shield,
  supplier: Building2,
  buyer: UserCircle,
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'approval': return CheckCircle;
    case 'expiry': return AlertTriangle;
    case 'rating': return Star;
    case 'enquiry': return MessageSquare;
    default: return Bell;
  }
};

const getNotificationColor = (type, urgent) => {
  if (urgent) return 'text-red-400';
  switch (type) {
    case 'approval': return 'text-emerald-400';
    case 'expiry': return 'text-amber-400';
    case 'rating': return 'text-blue-400';
    case 'enquiry': return 'text-primary';
    default: return 'text-muted-foreground';
  }
};

export const DashboardShell = ({ children }) => {
  const { currentRole, setCurrentRole } = useRole();
  const { currentUser, logout } = useAuth();
  const { activeSection, setActiveSection } = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState(
    currentRole === 'supplier' ? supplierNotifications : notifications
  );
  const [messagesList] = useState(messages);
  const displayName = currentUser?.name || roleLabels[currentRole];
  const displayCompany = currentUser?.company || roleLabels[currentRole];

  const navItems = navigationConfig[currentRole] || [];
  const RoleIcon = roleIcons[currentRole];
  const adminPathSection = location.pathname.split("/")[2] || "overview";
  const buyerPathSection = location.pathname.split("/")[2] || "overview";
  const supplierPathSection = location.pathname.split("/")[2] || "overview";
  const currentActiveSection =
    currentRole === "admin"
      ? (adminLegacyLinkMap[adminPathSection] || "overview")
      : currentRole === "buyer"
        ? buyerPathSection
        : currentRole === "supplier"
          ? (supplierRouteSectionMap[supplierPathSection] || activeSection)
          : activeSection;

  const unreadNotifications = notificationsList.filter(n => !n.read).length;
  const unreadMessages = messagesList.reduce((acc, m) => acc + m.unread, 0);
  const showHeaderCommunicationActions = currentRole !== "buyer";

  const handleNotificationClick = (notification) => {
    setNotificationsList(prev => prev.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    if (notification.link) {
      const adminSection = adminLegacyLinkMap[notification.link];
      if (currentRole === "admin" && adminSection) {
        setActiveSection(adminSection);
        navigate(adminPathBySection[adminSection]);
      } else if (currentRole === "buyer" && buyerPathBySection[notification.link]) {
        setActiveSection(notification.link);
        navigate(buyerPathBySection[notification.link]);
      } else if (currentRole === "supplier" && supplierPathBySection[notification.link]) {
        setActiveSection(notification.link);
        navigate(supplierPathBySection[notification.link]);
      } else {
        setActiveSection(notification.link);
      }
    }
    toast.info(notification.title);
  };

  const handleMessageClick = (message) => {
    setActiveSection('enquiries');
    if (currentRole === "admin") {
      setActiveSection("enquirymanagement");
      navigate("/admin/enquirymanagement");
    } else if (currentRole === "buyer") {
      navigate("/buyer/enquiries");
    } else if (currentRole === "supplier") {
      navigate("/supplier/enquiries");
    }
    toast.info(`Opening conversation: ${message.productName}`);
  };

  const handleViewAllNotifications = () => {
    setNotificationsOpen(false);
    if (currentRole === "admin") {
      setActiveSection("notificationmanagement");
      navigate("/admin/notificationmanagement");
      return;
    }
    if (currentRole === "supplier") {
      setActiveSection("notificationmanagement");
      navigate("/supplier/notificationmanagement");
      return;
    }
    toast.info("Notifications page is available for admin and supplier only.");
  };

  const handleViewAllEnquiries = () => {
    setMessagesOpen(false);
    if (currentRole === "admin") {
      setActiveSection("enquirymanagement");
      navigate("/admin/enquirymanagement");
      return;
    }
    if (currentRole === "buyer") {
      setActiveSection("enquiries");
      navigate("/buyer/enquiries");
      return;
    }
    if (currentRole === "supplier") {
      setActiveSection("enquiries");
      navigate("/supplier/enquiries");
      return;
    }
  };

  const handleNavigationClick = (item) => {
    setActiveSection(item.id);
    if ((currentRole === "admin" || currentRole === "buyer" || currentRole === "supplier") && item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden lg:flex flex-col bg-card/50 backdrop-blur-md border-r border-border transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              {/* <Shield className="h-6 w-6 text-primary" /> */}
              <img src={logo} alt="logo" className="h-8 w-28 text-primary" />
              {/* <span className="font-bold text-lg tracking-tight font-['Barlow_Condensed'] uppercase">
                Calidus Dashboard
              </span> */}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
            data-testid="sidebar-toggle-btn"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentActiveSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigationClick(item)}
                  data-testid={`nav-${item.id}`}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {sidebarOpen && isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Role Info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm bg-primary/20 flex items-center justify-center">
                <RoleIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {currentRole}
                </p>
                <p className="text-sm font-medium truncate">
                  {displayCompany}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border">
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img src={logo} alt="logo" className="h-8 w-24 text-primary" />
                {/* <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg tracking-tight font-['Barlow_Condensed'] uppercase">
                  DefenseLink
                </span> */}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8"
                data-testid="mobile-menu-close-btn"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 py-4 h-[calc(100vh-4rem)]">
              <nav className="space-y-1 px-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentActiveSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleNavigationClick(item);
                        setMobileMenuOpen(false);
                      }}
                      data-testid={`mobile-nav-${item.id}`}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-background/80 backdrop-blur-md border-b border-border">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(true)}
            data-testid="mobile-menu-btn"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Role Identity */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground/70 mb-1">
                Signed in as
              </p>
              <div className="h-9 min-w-[180px] rounded-sm border border-border bg-black/20 px-3 flex items-center gap-2 text-sm" data-testid="role-identity">
                <RoleIcon className="h-4 w-4 text-primary" />
                <span className="capitalize">{currentRole}</span>
              </div>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Global Search */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9 w-48 lg:w-64 h-9 bg-black/20 border-border rounded-sm"
                data-testid="global-search-input"
              />
            </div>

            {showHeaderCommunicationActions && (
              <>
                {/* Notifications */}
                <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative h-9 w-9"
                      data-testid="notifications-btn"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadNotifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-3 border-b border-border flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Notifications</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={handleViewAllNotifications}
                        data-testid="view-all-notifications-btn"
                      >
                        View all
                      </Button>
                    </div>
                    <ScrollArea className="h-[300px]">
                      {notificationsList.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {notificationsList.map((notification) => {
                            const Icon = getNotificationIcon(notification.type);
                            const iconColor = getNotificationColor(notification.type, notification.urgent);
                            return (
                              <button
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                                  !notification.read ? 'bg-primary/5' : ''
                                }`}
                                data-testid={`notification-${notification.id}`}
                              >
                                <div className="flex gap-3">
                                  <div className={`h-8 w-8 rounded-sm flex items-center justify-center flex-shrink-0 ${
                                    notification.urgent ? 'bg-red-500/20' : 'bg-muted'
                                  }`}>
                                    <Icon className={`h-4 w-4 ${iconColor}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                      {notification.date}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>

                {/* Messages */}
                <Popover open={messagesOpen} onOpenChange={setMessagesOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative h-9 w-9"
                      data-testid="messages-btn"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {unreadMessages > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary">
                          {unreadMessages}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-3 border-b border-border flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Enquiries</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={handleViewAllEnquiries}
                        data-testid="view-all-enquiries-btn"
                      >
                        View all
                      </Button>
                    </div>
                    <ScrollArea className="h-[300px]">
                      {messagesList.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No messages
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {messagesList.map((message) => (
                            <button
                              key={message.id}
                              onClick={() => handleMessageClick(message)}
                              className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                                message.unread > 0 ? 'bg-primary/5' : ''
                              }`}
                              data-testid={`message-${message.id}`}
                            >
                              <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${message.unread > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {message.productName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {message.participants.join(' ↔ ')}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate mt-1">
                                    {message.lastMessage}
                                  </p>
                                </div>
                                {message.unread > 0 && (
                                  <Badge className="h-5 px-1.5 text-[10px]">
                                    {message.unread}
                                  </Badge>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-9 gap-2 px-2"
                  data-testid="user-menu-btn"
                >
                  <div className="h-7 w-7 rounded-sm bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">
                    {displayName.split(" ")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  data-testid="user-menu-profile"
                  onClick={() => {
                    setActiveSection("profile");
                    if (currentRole === "admin" || currentRole === "sub_admin" || currentRole === "content_manager") {
                      navigate("/admin/profile");
                    } else if (currentRole === "buyer") {
                      navigate("/buyer/profile");
                    } else if (currentRole === "supplier") {
                      navigate("/supplier/companyprofile");
                    }
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {/* <DropdownMenuItem 
                  data-testid="user-menu-settings"
                  onClick={() => toast.info("Settings panel would open here")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive" 
                  data-testid="user-menu-logout"
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                    toast.success("Logged out successfully");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
