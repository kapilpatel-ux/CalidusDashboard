import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const supplierProfileApi = createApi({
  reducerPath: "supplierProfileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["SupplierProfile"],
  endpoints: (builder) => ({
    getSupplierProfile: builder.query({
      query: (supplierId) => `/api/suppliers/${supplierId}/profile`,
      providesTags: ["SupplierProfile"],
    }),
    updateSupplierProfile: builder.mutation({
      query: ({ supplierId, payload }) => ({
        url: `/api/suppliers/${supplierId}/profile`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["SupplierProfile"],
    }),
  }),
});

export const {
  useGetSupplierProfileQuery,
  useUpdateSupplierProfileMutation,
} = supplierProfileApi;
