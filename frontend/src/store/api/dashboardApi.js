import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboardOverview: builder.query({
      query: () => "/api/admin/dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardOverviewQuery } = dashboardApi;