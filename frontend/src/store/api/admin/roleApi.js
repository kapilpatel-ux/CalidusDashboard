import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const roleApi = createApi({
  reducerPath: "roleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["AdminRole"],
  endpoints: (builder) => ({
    getAdminRoles: builder.query({
      query: () => "/api/admin/roles",
      providesTags: ["AdminRole"],
    }),
    createAdminRole: builder.mutation({
      query: (payload) => ({
        url: "/api/admin/roles",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["AdminRole"],
    }),
    updateAdminRole: builder.mutation({
      query: ({ key, payload }) => ({
        url: `/api/admin/roles/${encodeURIComponent(key)}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["AdminRole"],
    }),
    deleteAdminRole: builder.mutation({
      query: (key) => ({
        url: `/api/admin/roles/${encodeURIComponent(key)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminRole"],
    }),
    updateAdminRolePermissions: builder.mutation({
      query: ({ key, permissions }) => ({
        url: `/api/admin/roles/${encodeURIComponent(key)}/permissions`,
        method: "PATCH",
        body: { permissions },
      }),
      invalidatesTags: ["AdminRole"],
    }),
  }),
});

export const {
  useGetAdminRolesQuery,
  useCreateAdminRoleMutation,
  useUpdateAdminRoleMutation,
  useDeleteAdminRoleMutation,
  useUpdateAdminRolePermissionsMutation,
} = roleApi;
