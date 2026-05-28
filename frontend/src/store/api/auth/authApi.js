import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";

const API_BASE_URL = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

const authBaseQuery = async ({ url, method = "GET", body }) => {
  try {
    const response = await axios({
      url: `${API_BASE_URL}${url}`,
      method,
      headers: { "Content-Type": "application/json" },
      data: body,
    });

    return { data: response.data };
  } catch (error) {
    if (error.response) {
      return {
        error: {
          status: error.response.status,
          data: error.response.data || { detail: `Request failed: ${error.response.status}` },
        },
      };
    }

    return {
      error: {
        status: "FETCH_ERROR",
        data: { detail: error?.message || "Network request failed" },
      },
    };
  }
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: authBaseQuery,
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
