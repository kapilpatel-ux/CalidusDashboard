import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const supplierApi = createApi({
  reducerPath: "supplierApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["Supplier"],
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: () => {
        console.log("API HIT: /api/suppliers");
        return "/api/suppliers";
      },
      providesTags: ["Supplier"],
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
  useUpdateSupplierStatusMutation,
  useDeleteSupplierMutation,
} = supplierApi;