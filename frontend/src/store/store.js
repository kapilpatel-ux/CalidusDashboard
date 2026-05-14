import { configureStore } from "@reduxjs/toolkit";
import { supplierApi } from "./api/supplierApi";
import { productApi } from "./api/productApi";
import { ratingApi } from "./api/ratingApi";
import { categoryApi } from "./api/categoryApi";
import { buyerApi } from "./api/buyerApi";
import { analyticsApi } from "./api/analyticsApi";
import { dashboardApi } from "./api/dashboardApi";

export const store = configureStore({
  reducer: {
    [supplierApi.reducerPath]: supplierApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [ratingApi.reducerPath]: ratingApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [buyerApi.reducerPath]: buyerApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(supplierApi.middleware, productApi.middleware, ratingApi.middleware, categoryApi.middleware, buyerApi.middleware, analyticsApi.middleware, dashboardApi.middleware),
});