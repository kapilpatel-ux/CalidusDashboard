import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { ActionButton, ActionButtonGroup } from "@/components/shared/ActionButton";
import { RatingStars } from "@/components/shared/RatingStars";
import { Eye, Check, X, Trash2, Ban, RotateCcw } from "lucide-react";
import { useGetRatingsQuery } from "@/store/api/admin/ratingApi";
import { useAdminActions } from "../AdminContext";

export const RatingsModeration = ({ onView, onConfirmAction } = {}) => {
  const { openViewSheet, openConfirmDialog } = useAdminActions();
  const handleView = onView || ((item) => openViewSheet("rating", item));
  const handleConfirmAction = onConfirmAction || openConfirmDialog;

  const { data: ratings = [], isLoading } = useGetRatingsQuery();

  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRatings =
    statusFilter === "all"
      ? ratings
      : ratings.filter((r) => r.status === statusFilter);

  const columns = [
    { key: "productName", label: "Product" },
    { key: "buyerName", label: "Buyer" },
    {
      key: "rating",
      label: "Rating",
      render: (value) => <RatingStars rating={value} size="sm" />,
    },
    {
      key: "review",
      label: "Review",
      render: (value) => <p className="text-sm max-w-xs truncate">{value}</p>,
    },
	    {
	      key: "status",
	      label: "Status",
	      render: (value) => <StatusBadge status={value} />,
	    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionButtonGroup>
          <ActionButton
            icon={Eye}
            label="View"
            testId={`view-rating-${row.id}`}
            onClick={() => handleView(row)}
          />

          {row.status === "pending" && (
            <>
              <ActionButton
                icon={Check}
                label="Approve"
                className="text-emerald-400 hover:text-emerald-300"
                testId={`approve-rating-${row.id}`}
                onClick={() =>
                  handleConfirmAction(
                    "approve-rating",
                    row,
                    `Approve rating for "${row.productName}"?`
                  )
                }
              />
              <ActionButton
                icon={X}
                label="Reject"
                className="text-red-400 hover:text-red-300"
                testId={`reject-rating-${row.id}`}
                onClick={() =>
                  handleConfirmAction(
                    "reject-rating",
                    row,
                    `Reject rating for "${row.productName}"?`
                  )
                }
              />
            </>
          )}

          {row.status === "approved" && (
            <ActionButton
              icon={Ban}
              label="Suspend"
              className="text-amber-400 hover:text-amber-300"
              testId={`suspend-rating-${row.id}`}
              onClick={() =>
                handleConfirmAction(
                  "suspend-rating",
                  row,
                  `Suspend rating for "${row.productName}"?`
                )
              }
            />
          )}

          {row.status === "suspended" && (
            <ActionButton
              icon={RotateCcw}
              label="Activate"
              className="text-emerald-400 hover:text-emerald-300"
              testId={`activate-rating-${row.id}`}
              onClick={() =>
                handleConfirmAction(
                  "approve-rating",
                  row,
                  `Activate rating for "${row.productName}"?`
                )
              }
            />
          )}

          {row.status === "rejected" && (
            <ActionButton
              icon={RotateCcw}
              label="Activate"
              className="text-emerald-400 hover:text-emerald-300"
              testId={`activate-rejected-rating-${row.id}`}
              onClick={() =>
                handleConfirmAction(
                  "approve-rating",
                  row,
                  `Activate rating for "${row.productName}"?`
                )
              }
            />
          )}

	          <ActionButton
	            icon={Trash2}
	            label="Remove"
	            className="text-red-400 hover:text-red-300"
            testId={`remove-rating-${row.id}`}
            onClick={() =>
              handleConfirmAction(
                "remove-rating",
                row,
                `Remove rating for "${row.productName}"?`
              )
            }
          />
        </ActionButtonGroup>
      ),
    },
  ];

  if (isLoading) return <p>Loading ratings...</p>;
  
	  return (
	    <div className="space-y-6" data-testid="ratings-moderation">
	      <div className="flex items-center justify-between flex-wrap gap-4">
	        <div>
	          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-1">
	            Ratings Moderation
	          </h1>
	          <p className="text-sm text-muted-foreground">
	            Review and moderate buyer ratings
	          </p>
	        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-black/20" data-testid="rating-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredRatings}
        searchPlaceholder="Search ratings..."
        searchKey="productName"
        pageSize={10}
        testId="ratings-table"
      />
    </div>
  );
};
