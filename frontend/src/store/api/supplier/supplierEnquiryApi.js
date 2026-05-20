import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { enquiryApi } from "@/store/api/admin/enquiryApi";

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
      keepUnusedDataFor: 0,
      refetchOnMountOrArgChange: true,
    }),

    replyToSupplierEnquiry: builder.mutation({
      query: ({ supplierId, enquiryId, reply }) => ({
        url: `/api/suppliers/${supplierId}/enquiries/${enquiryId}/reply`,
        method: "PATCH",
        body: { reply },
      }),
      invalidatesTags: ["SupplierEnquiry"],
    }),

    updateSupplierEnquiryStatus: builder.mutation({
      query: ({ supplierId, enquiryId, status }) => ({
        url: `/api/suppliers/${supplierId}/enquiries/${enquiryId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["SupplierEnquiry"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(enquiryApi.util.invalidateTags(["Enquiry"]));
        } catch (_) {
          // Page-level toast handles mutation failures.
        }
      },
    }),
  }),
});

export const {
  useGetSupplierEnquiriesQuery,
  useReplyToSupplierEnquiryMutation,
  useUpdateSupplierEnquiryStatusMutation,
} = supplierEnquiryApi;
