import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const enquiryApi = createApi({
  reducerPath: "enquiryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["Enquiry"],
  endpoints: (builder) => ({
    getEnquiries: builder.query({
      query: () => "/api/admin/enquiries",
      providesTags: ["Enquiry"],
    }),
    updateEnquiryStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/enquiries/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Enquiry"],
    }),
  }),
});

export const { useGetEnquiriesQuery, useUpdateEnquiryStatusMutation } = enquiryApi;
