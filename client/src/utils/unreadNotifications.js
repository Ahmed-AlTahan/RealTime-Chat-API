export const unreadNotificatinsFunc = (notifications) => {
    return notifications.filter((n) => n.isRead === false);
}