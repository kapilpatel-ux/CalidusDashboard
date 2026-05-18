import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
    }),
  }),
});

export const {
  useGetRatingsQuery,
  useUpdateRatingStatusMutation,
  useUpdateReplyStatusMutation,
  useDeleteRatingMutation,
} = ratingApi;