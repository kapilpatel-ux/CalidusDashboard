export const getSupplierById = (supplierId, suppliers) => {
  return suppliers.find((s) => s.id === supplierId) || null;
};

export const getSupplierProductCount = (
  supplierId,
  products
) => {
  return products.filter(
    (p) => p.supplierId === supplierId
  ).length;
};

export const getBuyerDetails = (
  buyer,
  enquiries,
  ratingsData
) => {
  const buyerEnquiries = enquiries.filter(
    (e) => e.buyerId === buyer.id
  );

  const buyerRatings = ratingsData.filter(
    (r) => r.buyerId === buyer.id
  );

  return {
    enquiries: buyerEnquiries,
    ratings: buyerRatings,
  };
};