import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Building2,
  Clock,
  Inbox,
  MessageSquare,
  Package,
  Star,
  UserCircle,
} from "lucide-react";
import { useGetSupplierOverviewQuery } from "@/store/api/supplier/supplierOverviewApi";

export const BuyerOverview = () => {
  const supplierId = "SUP001";

  const { data, isLoading, error } = useGetSupplierOverviewQuery(supplierId);

  if (isLoading) return <p>Loading overview...</p>;
  if (error) return <p>Failed to load overview.</p>;

  const buyer = data?.buyer || {};
  const stats = data?.stats || {};
  const recentEnquiries = data?.recentEnquiries || [];

  return (
    <div className="space-y-8" data-testid="buyer-overview">
      <div>
        <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
          Buyer Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {buyer.name || "Buyer"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Enquiries" value={stats.totalEnquiries || 0} icon={Inbox} trend="up" trendValue="+5" testId="stat-total-enquiries" />
        <StatCard title="Suppliers Contacted" value={stats.suppliersContacted || 0} icon={Building2} testId="stat-suppliers-contacted" />
        <StatCard title="Pending Responses" value={stats.pendingResponses || 0} icon={Clock} testId="stat-pending-responses" className="bg-amber-500/5 border-amber-500/20" />
        <StatCard title="Ratings Submitted" value={stats.submittedRatings || 0} icon={Star} testId="stat-ratings-submitted" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Your Profile</h3>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="dashboard-card-content space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-sm bg-primary/20 flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">{buyer.name || "N/A"}</h4>
                <p className="text-sm text-muted-foreground">{buyer.company || "N/A"}</p>
                <p className="text-xs text-muted-foreground">{buyer.country || "N/A"}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{buyer.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">{buyer.joinDate || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Recent Enquiries</h3>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="dashboard-card-content">
            {recentEnquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No enquiries yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="flex items-start gap-3">
                    <div
                      className={`h-8 w-8 rounded-sm flex items-center justify-center flex-shrink-0 ${
                        enquiry.status === "replied"
                          ? "bg-emerald-500/20"
                          : "bg-amber-500/20"
                      }`}
                    >
                      <Package
                        className={`h-4 w-4 ${
                          enquiry.status === "replied"
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {enquiry.productName || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        to {enquiry.supplierName || "N/A"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={enquiry.status} />
                        <span className="text-xs text-muted-foreground">
                          {enquiry.date || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};