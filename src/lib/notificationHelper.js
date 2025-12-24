import Notification from "@/models/Notification";

/**
 * Create notification for admin
 */
export async function notifyAdmin({ title, message, type = "info", priority = "medium", relatedId = null, relatedType = null, actionUrl = null }) {
  try {
    await Notification.create({
      forAdmin: true,
      title,
      message,
      type,
      priority,
      relatedId,
      relatedType,
      actionUrl,
    });
  } catch (error) {
    console.error("Error creating admin notification:", error);
  }
}

/**
 * Create notification for user
 */
export async function notifyUser({ userId, title, message, type = "info", priority = "medium", relatedId = null, relatedType = null, actionUrl = null }) {
  try {
    if (!userId) return;
    
    await Notification.create({
      userId,
      title,
      message,
      type,
      priority,
      relatedId,
      relatedType,
      actionUrl,
    });
  } catch (error) {
    console.error("Error creating user notification:", error);
  }
}
