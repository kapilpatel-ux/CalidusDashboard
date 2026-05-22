import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { Bell, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/App";
// import { suppliers } from "@/data/mockData";
import { useGetSupplierNotificationsQuery, useUpdateSupplierNotificationReadMutation } from "@/store/api/supplier/notificationApi";

export const SupplierNotificationManagement = () => {
  const { currentUser } = useAuth();
  // const currentSupplier = suppliers[0];
  // const supplierId = currentUser?.profileId || currentSupplier.id;

  const supplierId = currentUser?.profileId || currentUser?.id;

 
  const { data: notifications = [], isLoading } =
  useGetSupplierNotificationsQuery(supplierId, {
    skip: !supplierId,
  });

  const [updateRead] = useUpdateSupplierNotificationReadMutation();
  const [readFilter, setReadFilter] = useState("all");

  const filteredNotifications = readFilter === "all"
    ? notifications
    : notifications.filter((notification) => String(notification.read) === readFilter);

  const handleRead = async (row, read) => {
    try {
      await updateRead({ supplierId, id: row.id, read }).unwrap();
      toast.success(read ? "Notification marked read" : "Notification marked unread");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update notification");
    }
  };

  const columns = [
    { key: "title", label: "Title", render: (value, row) => <div><p className="font-medium">{value}</p><p className="text-xs text-muted-foreground">{row.message}</p></div> },
    { key: "type", label: "Type", render: (value) => <Badge variant="secondary">
    {value === "product" ? "Product" : value === "category" ? "Category" : value}</Badge> },
    { key: "date", label: "Date" },
    { key: "read", label: "State", render: (value) => <Badge className={value ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}>{value ? "Read" : "Unread"}</Badge> },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton icon={CheckCircle} label="Read" testId={`read-notification-${row.id}`} onClick={() => handleRead(row, true)} />
          <ActionButton icon={RotateCcw} label="Unread" testId={`unread-notification-${row.id}`} onClick={() => handleRead(row, false)} />
        </ActionButtonGroup>
      ),
    },
  ];

  if (isLoading) return <p>Loading notifications...</p>;
  if (!supplierId) return <p>Supplier profile not found.</p>;
  
  return (
    <div className="space-y-6" data-testid="supplier-notification-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">Notification Management</h1>
          <p className="text-sm text-muted-foreground">Review platform alerts and operational notifications</p>
        </div>
        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="w-[150px] bg-black/20" data-testid="notification-read-filter">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="false">Unread</SelectItem>
            <SelectItem value="true">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card"><Bell className="h-5 w-5 text-primary" /><p className="data-label mt-2">Total</p><p className="text-2xl font-bold">{notifications.length}</p></div>
        <div className="stat-card"><p className="data-label">Unread</p><p className="text-2xl font-bold">{notifications.filter((n) => !n.read).length}</p></div>
        <div className="stat-card"><p className="data-label">Read</p><p className="text-2xl font-bold">{notifications.filter((n) => n.read).length}</p></div>
      </div>
      <DataTable columns={columns} data={filteredNotifications} searchPlaceholder="Search notifications..." searchKey="title" pageSize={10} testId="supplier-notifications-table" />
    </div>
  );
};

