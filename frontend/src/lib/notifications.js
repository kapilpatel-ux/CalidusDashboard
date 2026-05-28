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

export const formatNotificationDateTime = (notification) => {
  const value =
    notification?.createdAt ||
    notification?.date ||
    notification?.updatedAt ||
    "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "—";
  }

  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
