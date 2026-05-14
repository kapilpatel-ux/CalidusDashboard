import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["Analytics"],
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: () => "/api/analytics",
      providesTags: ["Analytics"],
    }),
  }),
});

export const { useGetAnalyticsQuery } = analyticsApi;