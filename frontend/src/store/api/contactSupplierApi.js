import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const contactSupplierApi = createApi({
  reducerPath: "contactSupplierApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["ContactSupplier"],
  endpoints: (builder) => ({
    createContactSupplier: builder.mutation({
      query: (payload) => ({
        url: "/api/contact-supplier",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ContactSupplier"],
    }),
  }),
});

export const { useCreateContactSupplierMutation } = contactSupplierApi;