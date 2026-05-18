import { StatCard } from "@/components/shared/StatCard";
import {
  Building2,
  Users,
  Package,
  Clock,
  Star,
  FolderTree,
  TrendingUp,
  FileX,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useGetDashboardOverviewQuery } from "@/store/api/admin/dashboardApi";

const adminNavigationPaths = {
  suppliers: "/admin/suppliermanagement",
  products: "/admin/productmanagement",
  ratings: "/admin/ratingsmoderation",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-sm p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-muted-foreground">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AdminOverview = ({ onNavigate }) => {
  const navigate = useNavigate();

  const { data, isLoading } = useGetDashboardOverviewQuery();

  const handleNavigate = (section) => {
    if (onNavigate) {
      onNavigate(section);
      return;
    }

    navigate(adminNavigationPaths[section] || "/admin/overview");
  };

  if (isLoading) return <p>Loading overview...</p>;
  
  const stats = data?.stats || {};
  const analyticsData = data?.analyticsData || {};
  const documentStats = data?.documentStats || {};

  return (
    <div className="space-y-8" data-testid="admin-overview">
      <div>
        <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
          Platform Command Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor and manage all platform activities
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Suppliers" value={stats.totalSuppliers} icon={Building2} trend="up" trendValue="+12%" testId="stat-total-suppliers" />
        <StatCard title="Total Buyers" value={stats.totalBuyers} icon={Users} trend="up" trendValue="+8%" testId="stat-total-buyers" />
        <StatCard title="Total Products" value={stats.totalProducts} icon={Package} trend="up" trendValue="+15%" testId="stat-total-products" />
        <StatCard title="Categories" value={stats.totalCategories} icon={FolderTree} testId="stat-total-categories" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <button onClick={() => handleNavigate("suppliers")} className="stat-card bg-red-500/5 border-red-500/20 text-left hover:border-red-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <FileX className="h-5 w-5 text-red-400" />
            <div>
              <p className="data-label">Expired Documents</p>
              <p className="text-2xl font-bold font-['Barlow_Condensed']">
                {documentStats.expired}
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => handleNavigate("suppliers")} className="stat-card bg-amber-500/5 border-amber-500/20 text-left hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-400" />
            <div>
              <p className="data-label">Pending Supplier Approvals</p>
              <p className="text-2xl font-bold font-['Barlow_Condensed']">
                {stats.pendingSupplierApprovals}
              </p>
            </div>
          </div>
        </button>

        <button onClick={() => handleNavigate("products")} className="stat-card bg-amber-500/5 border-amber-500/20 text-left hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-400" />
            <div>
              <p className="data-label">Pending Product Approvals</p>
              <p className="text-2xl font-bold font-['Barlow_Condensed']">
                {stats.pendingProductApprovals}
              </p>
            </div>
          </div>
        </button>

        <button onClick={() => handleNavigate("ratings")} className="stat-card bg-amber-500/5 border-amber-500/20 text-left hover:border-amber-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-400" />
            <div>
              <p className="data-label">Pending Ratings</p>
              <p className="text-2xl font-bold font-['Barlow_Condensed']">
                {stats.pendingRatings}
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Category Demand Trends</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-card-content">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.categoryDemandTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="uav" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="UAV" />
                <Area type="monotone" dataKey="electronics" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Electronics" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Top Rated Suppliers</h3>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-card-content">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.topRatedSuppliers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" domain={[0, 5]} stroke="#666" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#666" fontSize={11} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rating" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Rating" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
