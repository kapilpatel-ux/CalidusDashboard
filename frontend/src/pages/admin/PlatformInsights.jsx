import { TrendingUp, Users, Package, Building2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useGetAnalyticsQuery } from "@/store/api/analyticsApi";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-sm p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>

        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-muted-foreground">
            <span style={{ color: entry.color }}>
              {entry.name}:
            </span>{" "}
            {entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export const PlatformInsights = ( ) => {

  const { data: analyticsData, isLoading } = useGetAnalyticsQuery();

  if (isLoading) return <p>Loading analytics...</p>;
  if (!analyticsData) return <p>No analytics found.</p>;
  
  const pieData = [
    { name: "Approved", value: 65 },
    { name: "Pending", value: 20 },
    { name: "Rejected", value: 15 },
  ];

  const COLORS = ["#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6" data-testid="platform-insights">
      <div>
        <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
          Platform Insights
        </h1>

        <p className="text-sm text-muted-foreground">
          Analytics and platform performance overview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Growth */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">
              Supplier Growth
            </h3>

            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="dashboard-card-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.supplierGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                <XAxis
                  dataKey="month"
                  stroke="#666"
                  fontSize={11}
                />

                <YAxis stroke="#666" fontSize={11} />

                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="suppliers"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Suppliers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buyer Growth */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">
              Buyer Growth
            </h3>

            <Users className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="dashboard-card-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.buyerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                <XAxis
                  dataKey="month"
                  stroke="#666"
                  fontSize={11}
                />

                <YAxis stroke="#666" fontSize={11} />

                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="buyers"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Buyers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Analytics */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">
              Product Analytics
            </h3>

            <Package className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="dashboard-card-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.categoryDemandTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                <XAxis
                  dataKey="month"
                  stroke="#666"
                  fontSize={11}
                />

                <YAxis stroke="#666" fontSize={11} />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="uav"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="UAV"
                />

                <Bar
                  dataKey="electronics"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Electronics"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approval Distribution */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">
              Approval Distribution
            </h3>

            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="dashboard-card-content flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};