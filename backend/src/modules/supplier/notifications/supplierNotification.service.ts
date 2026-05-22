import { createReadableId } from "../../../utils/id.js";
import { SupplierNotificationModel } from "./supplierNotification.model.js";

type CreateSupplierNotificationParams = {
  supplierId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
};

export const createSupplierNotification = async ({
  supplierId,
  type,
  title,
  message,
  link = "",
}: CreateSupplierNotificationParams) => {
  console.log("CREATING SUPPLIER NOTIFICATION:", {
    supplierId,
    type,
    title,
    message,
    link,
  });
  return SupplierNotificationModel.create({
    id: createReadableId("SUP-NOTIF"),
    supplierId,
    audience: "supplier",
    type,
    title,
    message,
    link,
    read: false,
    date: new Date().toISOString(),
  });
};