import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const supplierProductApi = createApi({
  reducerPath: "supplierProductApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["SupplierProduct"],
  endpoints: (builder) => ({
    getSupplierProducts: builder.query({
      query: (supplierId) => `/api/suppliers/${supplierId}/products`,
      providesTags: ["SupplierProduct"],
    }),

    createSupplierProduct: builder.mutation({
      query: ({ supplierId, payload }) => ({
        url: `/api/suppliers/${supplierId}/products`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SupplierProduct"],
    }),

    updateSupplierProduct: builder.mutation({
      query: ({ supplierId, productId, payload }) => ({
        url: `/api/suppliers/${supplierId}/products/${productId}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["SupplierProduct"],
    }),

    deleteSupplierProduct: builder.mutation({
      query: ({ supplierId, productId }) => ({
        url: `/api/suppliers/${supplierId}/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SupplierProduct"],
    }),
  }),
});

export const {
  useGetSupplierProductsQuery,
  useCreateSupplierProductMutation,
  useUpdateSupplierProductMutation,
  useDeleteSupplierProductMutation,
} = supplierProductApi;
