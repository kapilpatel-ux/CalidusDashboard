import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/shared/StatCard";
import { RatingStars } from "@/components/shared/RatingStars";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Building2,
  ChevronRight,
  Clock,
  Eye,
  FileWarning,
  FileX,
  Inbox,
  Package,
  Star,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/App";
import { currentSupplier } from "@/data/mockData";
import { useGetSupplierOverviewQuery } from "@/store/api/supplier/supplierOverviewApi";

export const SupplierOverview = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const supplierId = currentUser?.profileId || currentSupplier.id;
  const { data, isLoading, error } = useGetSupplierOverviewQuery(supplierId);

  if (isLoading) return <p>Loading supplier overview...</p>;
  if (error) return <p>Failed to load supplier overview.</p>;

  const supplier = data?.supplier || {};
  const stats = data?.stats || {};
  const expiringDocs = data?.expiringDocs || [];

  return (
    <div className="space-y-8" data-testid="supplier-overview">
      <div>
        <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Supplier Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {supplier.name || "Supplier"}</p>
      </div>

      {expiringDocs.length > 0 && (
        <div className="space-y-2">
          {expiringDocs.map((doc, idx) => (
            <button
              key={`${doc.name}-${idx}`}
              onClick={() => navigate("/supplier/companyprofile")}
              className={`w-full p-3 rounded-sm flex items-center gap-3 text-left transition-colors ${
                doc.status === "expired"
                  ? "bg-red-500/10 border border-red-500/20 hover:border-red-500/40"
                  : "bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40"
              }`}
              data-testid={`doc-alert-${idx}`}
            >
              {doc.status === "expired" ? <FileX className="h-5 w-5 text-red-400" /> : <FileWarning className="h-5 w-5 text-amber-400" />}
              <div className="flex-1">
                <p className={`text-sm font-medium ${doc.status === "expired" ? "text-red-400" : "text-amber-400"}`}>
                  {doc.status === "expired" ? `Your ${doc.name} has expired. Please re-upload.` : `Your ${doc.name} expires on ${doc.expiryDate}. Please renew.`}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Profile Views" value={Number(stats.profileViews || 0).toLocaleString()} icon={Eye} trend="up" trendValue="+18%" testId="stat-profile-views" />
        <StatCard title="Total Enquiries" value={stats.totalEnquiries || 0} icon={Inbox} trend="up" trendValue="+12%" testId="stat-total-enquiries" />
        <StatCard title="Active Products" value={stats.activeProducts || 0} icon={Package} testId="stat-active-products" />
        <StatCard title="Average Rating" value={Number(stats.averageRating || 0).toFixed(1)} icon={Star} testId="stat-average-rating" />
        <StatCard title="Pending Approvals" value={stats.pendingProductApprovals || 0} icon={Clock} testId="stat-pending-approvals" className="bg-amber-500/5 border-amber-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Company Overview</h3>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-card-content space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-sm bg-primary/20 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">{supplier.name || "N/A"}</h4>
                <p className="text-sm text-muted-foreground">{supplier.type || "Supplier"} • {supplier.country || "N/A"}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {(supplier.certifications || []).map((cert, idx) => (
                  <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-sm flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Performance Metrics</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="dashboard-card-content space-y-4">
            <Metric label="Profile Completion" value={stats.profileCompletion || 0} />
            <Metric label="Response Rate" value={stats.responseRate || 0} />
            <Metric label="Product Quality Score" value={stats.productQualityScore || 0} />
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-medium">Verified Supplier</span>
              </div>
              <RatingStars rating={Number(stats.averageRating || supplier.rating || 0)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}%</span>
    </div>
    <Progress value={value} className="h-2" />
  </div>
);
