import { configureStore } from "@reduxjs/toolkit";
import { supplierApi } from "./api/admin/supplierApi";
import { productApi } from "./api/admin/productApi";
import { ratingApi } from "./api/admin/ratingApi";
import { categoryApi } from "./api/admin/categoryApi";
import { buyerApi } from "./api/admin/buyerApi";
import { analyticsApi } from "./api/admin/analyticsApi";
import { dashboardApi } from "./api/admin/dashboardApi";
import { enquiryApi } from "./api/admin/enquiryApi";
import { notificationApi } from "./api/admin/notificationApi";
import { userApi } from "./api/admin/userApi";
import { supplierOverviewApi } from "./api/supplier/supplierOverviewApi";
import { supplierProductApi } from "./api/supplier/supplierProductApi";
import { supplierProfileApi } from "./api/supplier/supplierProfileApi";
import { buyerEnquiryApi } from "./api/buyer/buyerEnquiryApi";
import { buyerProfileApi } from "./api/buyer/buyerProfileApi";
import { buyerRatingApi } from "./api/buyer/buyerRatingApi";

export const store = configureStore({
  reducer: {
    [supplierApi.reducerPath]: supplierApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [ratingApi.reducerPath]: ratingApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [buyerApi.reducerPath]: buyerApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [enquiryApi.reducerPath]: enquiryApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [supplierOverviewApi.reducerPath]: supplierOverviewApi.reducer,
    [supplierProductApi.reducerPath]: supplierProductApi.reducer,
    [supplierProfileApi.reducerPath]: supplierProfileApi.reducer,
    [buyerEnquiryApi.reducerPath]: buyerEnquiryApi.reducer,
    [buyerProfileApi.reducerPath]: buyerProfileApi.reducer,
    [buyerRatingApi.reducerPath]: buyerRatingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(supplierApi.middleware, productApi.middleware, ratingApi.middleware, categoryApi.middleware, buyerApi.middleware, analyticsApi.middleware, dashboardApi.middleware, enquiryApi.middleware, notificationApi.middleware, userApi.middleware, supplierOverviewApi.middleware, supplierProductApi.middleware, supplierProfileApi.middleware, buyerEnquiryApi.middleware, buyerProfileApi.middleware, buyerRatingApi.middleware),
});
