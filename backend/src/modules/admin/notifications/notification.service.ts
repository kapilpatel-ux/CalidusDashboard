import { createReadableId } from "../../../utils/id.js";
import { NotificationModel } from "./notification.model.js";

const nowIso = () => new Date().toISOString();

export type AdminNotificationInput = {
  type?: string;
  title: string;
  message: string;
  link?: string;
};

export async function createAdminNotification(input: AdminNotificationInput) {
  const created = await NotificationModel.create({
    id: createReadableId("NOT"),
    audience: "admin",
    type: input.type || "info",
    title: input.title,
    message: input.message,
    date: nowIso(),
    read: false,
    link: input.link || "notificationmanagement",
  });

  return created.toJSON();
}
