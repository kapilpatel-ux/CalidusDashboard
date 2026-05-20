import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const supplierRatingApi = createApi({
  reducerPath: "supplierRatingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["SupplierRating"],
  endpoints: (builder) => ({
    getSupplierRatings: builder.query({
      query: (supplierId) => `/api/suppliers/${supplierId}/ratings`,
      providesTags: ["SupplierRating"],
    }),

    replyToSupplierRating: builder.mutation({
      query: ({ supplierId, ratingId, reply }) => ({
        url: `/api/suppliers/${supplierId}/ratings/${ratingId}/reply`,
        method: "PATCH",
        body: { reply },
      }),
      invalidatesTags: ["SupplierRating"],
    }),
  }),
});

export const {
  useGetSupplierRatingsQuery,
  useReplyToSupplierRatingMutation,
} = supplierRatingApi;
