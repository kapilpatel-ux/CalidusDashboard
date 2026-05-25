import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { enquiryApi } from "@/store/api/admin/enquiryApi";
import { buyerOverviewApi } from "@/store/api/buyer/buyerOverviewApi";
import { supplierOverviewApi } from "@/store/api/supplier/supplierOverviewApi";

const invalidateEnquiryDependents = (dispatch) => {
  dispatch(enquiryApi.util.invalidateTags(["Enquiry"]));
  dispatch(buyerOverviewApi.util.invalidateTags(["BuyerOverview"]));
  dispatch(supplierOverviewApi.util.invalidateTags(["SupplierOverview"]));
};

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          invalidateEnquiryDependents(dispatch);
        } catch (_) {
          // Page-level toast handles mutation failures.
        }
      },
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
          invalidateEnquiryDependents(dispatch);
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
