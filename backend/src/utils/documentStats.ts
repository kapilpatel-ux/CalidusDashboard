type SupplierDocument = {
  expiryDate?: string;
  status?: string;
};

type SupplierLike = {
  documents?: SupplierDocument[];
};

const today = new Date();

export function getDocumentExpiryStats(suppliers: SupplierLike[]) {
  return suppliers.reduce(
    (stats, supplier) => {
      for (const document of supplier.documents || []) {
        if (document.status === "expired") {
          stats.expired += 1;
          continue;
        }

        if (!document.expiryDate) continue;

        const expiryDate = new Date(document.expiryDate);
        const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) stats.expired += 1;
        else if (daysLeft <= 30) stats.expiringSoon += 1;
        else stats.active += 1;
      }

      return stats;
    },
    { expired: 0, expiringSoon: 0, active: 0 },
  );
}
