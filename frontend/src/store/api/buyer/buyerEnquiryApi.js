import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
    }),

    createBuyerEnquiry: builder.mutation({
      query: ({ buyerId, payload }) => ({
        url: `/api/buyers/${buyerId}/enquiries`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["BuyerEnquiry"],
    }),
  }),
});

export const {
  useGetBuyerEnquiriesQuery,
  useCreateBuyerEnquiryMutation,
} = buyerEnquiryApi;
