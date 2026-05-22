import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const permissionApi = createApi({
  reducerPath: "permissionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["AdminPermission"],
  endpoints: (builder) => ({
    getAdminPermissions: builder.query({
      query: () => "/api/admin/permissions",
      providesTags: ["AdminPermission"],
    }),
    createAdminPermission: builder.mutation({
      query: (payload) => ({
        url: "/api/admin/permissions",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["AdminPermission"],
    }),
    updateAdminPermission: builder.mutation({
      query: ({ key, payload }) => ({
        url: `/api/admin/permissions/${encodeURIComponent(key)}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["AdminPermission"],
    }),
    deleteAdminPermission: builder.mutation({
      query: (key) => ({
        url: `/api/admin/permissions/${encodeURIComponent(key)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminPermission"],
    }),
  }),
});

export const {
  useGetAdminPermissionsQuery,
  useCreateAdminPermissionMutation,
  useUpdateAdminPermissionMutation,
  useDeleteAdminPermissionMutation,
} = permissionApi;

