import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const buyerProfileApi = createApi({
  reducerPath: "buyerProfileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["BuyerProfile"],
  endpoints: (builder) => ({
    getBuyerProfile: builder.query({
      query: (buyerId) => `/api/buyers/${buyerId}/profile`,
      providesTags: ["BuyerProfile"],
    }),

    updateBuyerProfile: builder.mutation({
      query: ({ buyerId, payload }) => ({
        url: `/api/buyers/${buyerId}/profile`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["BuyerProfile"],
    }),
  }),
});

export const {
  useGetBuyerProfileQuery,
  useUpdateBuyerProfileMutation,
} = buyerProfileApi;
