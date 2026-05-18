import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const supplierOverviewApi = createApi({
  reducerPath: "supplierOverviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["SupplierOverview"],
  endpoints: (builder) => ({
    getSupplierOverview: builder.query({
      query: (supplierId) => `/api/suppliers/${supplierId}/overview`,
      providesTags: ["SupplierOverview"],
    }),
  }),
});

export const { useGetSupplierOverviewQuery } = supplierOverviewApi;