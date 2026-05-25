import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ratingApi } from "@/store/api/admin/ratingApi";
import { productApi } from "@/store/api/admin/productApi";
import { supplierRatingApi } from "@/store/api/supplier/supplierRatingApi";
import { supplierOverviewApi } from "@/store/api/supplier/supplierOverviewApi";
import { buyerProfileApi } from "@/store/api/buyer/buyerProfileApi";

const invalidateRatingDependents = (dispatch) => {
  dispatch(ratingApi.util.invalidateTags(["Rating"]));
  dispatch(productApi.util.invalidateTags(["Product"]));
  dispatch(supplierRatingApi.util.invalidateTags(["SupplierRating"]));
  dispatch(supplierOverviewApi.util.invalidateTags(["SupplierOverview"]));
  dispatch(buyerProfileApi.util.invalidateTags(["BuyerProfile"]));
};

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          invalidateRatingDependents(dispatch);
        } catch (_) {
          // handled by calling component
        }
      },
    }),

    updateBuyerRating: builder.mutation({
      query: ({ buyerId, ratingId, payload }) => ({
        url: `/api/buyers/${buyerId}/ratings/${ratingId}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["BuyerRating"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          invalidateRatingDependents(dispatch);
        } catch (_) {
          // handled by calling component
        }
      },
    }),
  }),
});

export const {
  useGetBuyerRatingsQuery,
  useCreateBuyerRatingMutation,
  useUpdateBuyerRatingMutation,
} = buyerRatingApi;
