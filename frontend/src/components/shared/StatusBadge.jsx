import { cn } from "@/lib/utils";

const statusStyles = {
  active: "status-badge-active",
  approved: "status-badge-approved",
  pending: "status-badge-pending",
  suspended: "status-badge-suspended",
  rejected: "status-badge-rejected",
  replied: "status-badge-replied",
  resolved: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

export const StatusBadge = ({ status, className }) => {
  const normalizedStatus = status?.toLowerCase() || "pending";
  
  return (
    <span 
      className={cn(
        "status-badge",
        statusStyles[normalizedStatus] || statusStyles.pending,
        className
      )}
    >
      {status}
    </span>
  );
};
