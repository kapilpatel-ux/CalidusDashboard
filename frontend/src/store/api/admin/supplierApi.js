import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const supplierApi = createApi({
  reducerPath: "supplierApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),

  tagTypes: ["Supplier"],

  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: () => "/api/suppliers",
      providesTags: ["Supplier"],
    }),

    getSupplier: builder.query({
      query: (id) => `/api/suppliers/${id}`,
      providesTags: ["Supplier"],
    }),

    createSupplier: builder.mutation({
      query: (payload) => ({
        url: "/api/suppliers",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Supplier"],
    }),

    updateSupplier: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/suppliers/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Supplier"],
    }),

    updateSupplierStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/suppliers/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Supplier"],
    }),

    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/api/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supplier"],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useUpdateSupplierStatusMutation,
  useDeleteSupplierMutation,
} = supplierApi;