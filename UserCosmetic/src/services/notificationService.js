import { database } from "../../firebaseConfig";
import { ref, onValue, query, orderByChild, update } from "firebase/database";

// Fetch all notifications
export const fetchNotifications = (callback) => {
  const notificationsRef = ref(database, "notifications");

  // Create a query to order by createdAt in descending order
  const notificationsQuery = query(notificationsRef, orderByChild("createdAt"));

  const unsubscribe = onValue(
    notificationsQuery,
    (snapshot) => {
      const data = snapshot.val();

      if (data) {
        // Convert to array and reverse to get newest first
        const notificationsArray = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
            isRead: data[key].isRead || false, // Default to false if not set
          }))
          .reverse();

        callback(notificationsArray);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error("Error fetching notifications:", error);
      callback([]);
    }
  );

  // Return unsubscribe function to clean up listener when needed
  return unsubscribe;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = ref(database, `notifications/${notificationId}`);
    await update(notificationRef, {
      isRead: true,
      readAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
