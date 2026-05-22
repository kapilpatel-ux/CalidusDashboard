import { createApi } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (_) {
    return { detail: text };
  }
};

export const contactSupplierApi = createApi({
  reducerPath: "contactSupplierApi",
  baseQuery: async ({ url, method = "GET", body }) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await parseResponse(response);

      if (!response.ok) {
        return {
          error: {
            status: response.status,
            data: data || { detail: `Request failed: ${response.status}` },
          },
        };
      }

      return { data };
    } catch (error) {
      return {
        error: {
          status: "FETCH_ERROR",
          data: { detail: error?.message || "Network request failed" },
        },
      };
    }
  },
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
