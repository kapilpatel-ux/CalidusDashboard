import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/login",
        method: "POST",
        body: payload,
      }),
    }),

    signup: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/signup",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
} = authApi;
