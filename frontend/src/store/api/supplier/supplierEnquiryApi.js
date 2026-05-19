import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const supplierEnquiryApi = createApi({
  reducerPath: "supplierEnquiryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["SupplierEnquiry"],
  endpoints: (builder) => ({
    getSupplierEnquiries: builder.query({
      query: (supplierId) => `/api/suppliers/${supplierId}/enquiries`,
      providesTags: ["SupplierEnquiry"],
    }),

    replyToSupplierEnquiry: builder.mutation({
      query: ({ supplierId, enquiryId, reply }) => ({
        url: `/api/suppliers/${supplierId}/enquiries/${enquiryId}/reply`,
        method: "PATCH",
        body: { reply },
      }),
      invalidatesTags: ["SupplierEnquiry"],
    }),
  }),
});

export const {
  useGetSupplierEnquiriesQuery,
  useReplyToSupplierEnquiryMutation,
} = supplierEnquiryApi;
