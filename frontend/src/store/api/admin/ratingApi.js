import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { productApi } from "@/store/api/admin/productApi";
import { supplierRatingApi } from "@/store/api/supplier/supplierRatingApi";
import { supplierOverviewApi } from "@/store/api/supplier/supplierOverviewApi";
import { buyerOverviewApi } from "@/store/api/buyer/buyerOverviewApi";

const invalidateModerationDependents = (dispatch) => {
  dispatch(productApi.util.invalidateTags(["Product"]));
  dispatch(supplierRatingApi.util.invalidateTags(["SupplierRating"]));
  dispatch(supplierOverviewApi.util.invalidateTags(["SupplierOverview"]));
  dispatch(buyerOverviewApi.util.invalidateTags(["BuyerOverview"]));
};

export const ratingApi = createApi({
  reducerPath: "ratingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["Rating"],
  endpoints: (builder) => ({
    getRatings: builder.query({
      query: () => "/api/ratings",
      providesTags: ["Rating"],
    }),

    updateRatingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/ratings/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Rating"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          invalidateModerationDependents(dispatch);
        } catch (_) {
          // handled by calling component
        }
      },
    }),

    updateReplyStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/ratings/${id}/reply-status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Rating"],
    }),

    deleteRating: builder.mutation({
      query: (id) => ({
        url: `/api/ratings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rating"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          invalidateModerationDependents(dispatch);
        } catch (_) {
          // handled by calling component
        }
      },
    }),
  }),
});

export const {
  useGetRatingsQuery,
  useUpdateRatingStatusMutation,
  useUpdateReplyStatusMutation,
  useDeleteRatingMutation,
} = ratingApi;
