import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const buyerOverviewApi = createApi({
  reducerPath: "buyerOverviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["BuyerOverview"],
  endpoints: (builder) => ({
    getBuyerOverview: builder.query({
      query: (buyerId) => `/api/buyers/${buyerId}/overview`,
      providesTags: ["BuyerOverview"],
      keepUnusedDataFor: 0,
      refetchOnMountOrArgChange: true,
    }),
  }),
});

export const { useGetBuyerOverviewQuery } = buyerOverviewApi;
