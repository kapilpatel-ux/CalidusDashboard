import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const supplierNotificationApi = createApi({
  reducerPath: "supplierNotificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["SupplierNotification"],
  endpoints: (builder) => ({
    getSupplierNotifications: builder.query({
      query: (supplierId) => `/api/suppliers/${supplierId}/notifications`,
      providesTags: ["SupplierNotification"],
    }),
    updateSupplierNotificationRead: builder.mutation({
      query: ({ supplierId, id, read }) => ({
        url: `/api/suppliers/${supplierId}/notifications/${id}/read`,
        method: "PATCH",
        body: { read },
      }),
      invalidatesTags: ["SupplierNotification"],
    }),
  }),
});

export const { useGetSupplierNotificationsQuery, useUpdateSupplierNotificationReadMutation } = supplierNotificationApi;

