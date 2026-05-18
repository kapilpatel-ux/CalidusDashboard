import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => "/api/categories",
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation({
      query: (payload) => ({
        url: "/api/categories",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/categories/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Category"],
    }),

    updateSubcategory: builder.mutation({
      query: ({ categoryId, subcategoryId, payload }) => ({
        url: `/api/categories/${categoryId}/subcategories/${subcategoryId}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/api/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    deleteSubcategory: builder.mutation({
      query: ({ categoryId, subcategoryId }) => ({
        url: `/api/categories/${categoryId}/subcategories/${subcategoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useDeleteSubcategoryMutation,
  useUpdateCategoryMutation,
  useUpdateSubcategoryMutation, 
} = categoryApi;
