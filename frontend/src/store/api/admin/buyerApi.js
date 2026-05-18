import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const buyerApi = createApi({
  reducerPath: "buyerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["Buyer"],
  endpoints: (builder) => ({
    getBuyers: builder.query({
      query: () => "/api/buyers",
      providesTags: ["Buyer"],
    }),

    updateBuyerStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/buyers/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Buyer"],
    }),

    deleteBuyer: builder.mutation({
      query: (id) => ({
        url: `/api/buyers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Buyer"],
    }),
  }),
});

export const {
  useGetBuyersQuery,
  useUpdateBuyerStatusMutation,
  useDeleteBuyerMutation,
} = buyerApi;