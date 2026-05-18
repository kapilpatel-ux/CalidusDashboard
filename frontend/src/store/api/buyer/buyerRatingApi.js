import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const buyerRatingApi = createApi({
  reducerPath: "buyerRatingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["BuyerRating"],
  endpoints: (builder) => ({
    getBuyerRatings: builder.query({
      query: (buyerId) => `/api/buyers/${buyerId}/ratings`,
      providesTags: ["BuyerRating"],
    }),

    createBuyerRating: builder.mutation({
      query: ({ buyerId, payload }) => ({
        url: `/api/buyers/${buyerId}/ratings`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["BuyerRating"],
    }),

    updateBuyerRating: builder.mutation({
      query: ({ buyerId, ratingId, payload }) => ({
        url: `/api/buyers/${buyerId}/ratings/${ratingId}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["BuyerRating"],
    }),
  }),
});

export const {
  useGetBuyerRatingsQuery,
  useCreateBuyerRatingMutation,
  useUpdateBuyerRatingMutation,
} = buyerRatingApi;
