import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => "/api/admin/notifications",
      providesTags: ["Notification"],
    }),
    updateNotificationRead: builder.mutation({
      query: ({ id, read }) => ({
        url: `/api/admin/notifications/${id}/read`,
        method: "PATCH",
        body: { read },
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useGetNotificationsQuery, useUpdateNotificationReadMutation } = notificationApi;
