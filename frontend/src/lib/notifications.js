export const getNotificationTime = (notification) => {
  const value =
    notification?.createdAt ||
    notification?.date ||
    notification?.updatedAt ||
    "";
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export const sortNotificationsNewestFirst = (notifications) => {
  if (!Array.isArray(notifications)) return [];

  return notifications
    .slice()
    .sort((a, b) => getNotificationTime(b) - getNotificationTime(a));
};
