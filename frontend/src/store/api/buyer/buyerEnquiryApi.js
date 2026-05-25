import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { enquiryApi } from "@/store/api/admin/enquiryApi";
import { supplierEnquiryApi } from "@/store/api/supplier/supplierEnquiryApi";
import { supplierOverviewApi } from "@/store/api/supplier/supplierOverviewApi";
import { buyerOverviewApi } from "@/store/api/buyer/buyerOverviewApi";

export const buyerEnquiryApi = createApi({
  reducerPath: "buyerEnquiryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["BuyerEnquiry"],
  endpoints: (builder) => ({
    getBuyerEnquiries: builder.query({
      query: (buyerId) => `/api/buyers/${buyerId}/enquiries`,
      providesTags: ["BuyerEnquiry"],
      keepUnusedDataFor: 0,
      refetchOnMountOrArgChange: true,
    }),

    createBuyerEnquiry: builder.mutation({
      query: ({ buyerId, payload }) => ({
        url: `/api/buyers/${buyerId}/enquiries`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["BuyerEnquiry"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(enquiryApi.util.invalidateTags(["Enquiry"]));
          dispatch(supplierEnquiryApi.util.invalidateTags(["SupplierEnquiry"]));
          dispatch(supplierOverviewApi.util.invalidateTags(["SupplierOverview"]));
          dispatch(buyerOverviewApi.util.invalidateTags(["BuyerOverview"]));
        } catch (_) {
          // The mutation error is handled by the page-level toast.
        }
      },
    }),
  }),
});

export const {
  useGetBuyerEnquiriesQuery,
  useCreateBuyerEnquiryMutation,
} = buyerEnquiryApi;
