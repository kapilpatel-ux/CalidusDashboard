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
import { roleApi } from "./api/admin/roleApi";
import { permissionApi } from "./api/admin/permissionApi";
import { authApi } from "./api/auth/authApi";
import { supplierEnquiryApi } from "./api/supplier/supplierEnquiryApi";
import { supplierCategoryRequestApi } from "./api/supplier/categoryRequestApi";
import { supplierNotificationApi } from "./api/supplier/notificationApi";
import { supplierOverviewApi } from "./api/supplier/supplierOverviewApi";
import { supplierProductApi } from "./api/supplier/supplierProductApi";
import { supplierProfileApi } from "./api/supplier/supplierProfileApi";
import { supplierRatingApi } from "./api/supplier/supplierRatingApi";
import { buyerEnquiryApi } from "./api/buyer/buyerEnquiryApi";
import { buyerProfileApi } from "./api/buyer/buyerProfileApi";
import { buyerRatingApi } from "./api/buyer/buyerRatingApi";
import { contactSupplierApi } from "./api/contactSupplierApi";

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
    [roleApi.reducerPath]: roleApi.reducer,
    [permissionApi.reducerPath]: permissionApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [supplierEnquiryApi.reducerPath]: supplierEnquiryApi.reducer,
    [supplierCategoryRequestApi.reducerPath]: supplierCategoryRequestApi.reducer,
    [supplierNotificationApi.reducerPath]: supplierNotificationApi.reducer,
    [supplierOverviewApi.reducerPath]: supplierOverviewApi.reducer,
    [supplierProductApi.reducerPath]: supplierProductApi.reducer,
    [supplierProfileApi.reducerPath]: supplierProfileApi.reducer,
    [supplierRatingApi.reducerPath]: supplierRatingApi.reducer,
    [buyerEnquiryApi.reducerPath]: buyerEnquiryApi.reducer,
    [buyerProfileApi.reducerPath]: buyerProfileApi.reducer,
    [buyerRatingApi.reducerPath]: buyerRatingApi.reducer,
    [contactSupplierApi.reducerPath]: contactSupplierApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(supplierApi.middleware, productApi.middleware, ratingApi.middleware, categoryApi.middleware, buyerApi.middleware, analyticsApi.middleware, dashboardApi.middleware, enquiryApi.middleware, notificationApi.middleware, userApi.middleware, roleApi.middleware, permissionApi.middleware, authApi.middleware, supplierEnquiryApi.middleware, supplierCategoryRequestApi.middleware , supplierNotificationApi.middleware, supplierOverviewApi.middleware, supplierProductApi.middleware, supplierProfileApi.middleware, supplierRatingApi.middleware, buyerEnquiryApi.middleware, buyerProfileApi.middleware, buyerRatingApi.middleware, contactSupplierApi.middleware),
});
