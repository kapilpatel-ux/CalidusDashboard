import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/api/admin/users",
      providesTags: ["User"],
    }),
    createUser: builder.mutation({
      query: (payload) => ({
        url: "/api/admin/users",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/admin/users/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserMutation,
} = userApi;
