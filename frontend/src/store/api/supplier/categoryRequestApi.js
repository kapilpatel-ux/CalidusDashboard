import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const supplierCategoryRequestApi = createApi({
  reducerPath: "supplierCategoryRequestApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getSupplierCategories: builder.query({
      query: (supplierId) => `/api/suppliers/${supplierId}/categories`,
      providesTags: ["Category"],
    }),
    getCategoryRequests: builder.query({
      query: (supplierId) => `/api/suppliers/${supplierId}/categories/requests`,
      providesTags: ["Category"],
    }),
    requestCategory: builder.mutation({
      query: ({ supplierId, payload }) => ({
        url: `/api/suppliers/${supplierId}/categories/requests`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const { useGetSupplierCategoriesQuery, useGetCategoryRequestsQuery, useRequestCategoryMutation } = supplierCategoryRequestApi;
