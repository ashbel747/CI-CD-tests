"use client";

import { useEffect, useState } from "react";
import {
  fetchNotifications,
  deleteNotification,
  markAsRead,
  Notification,
} from "../lib/notifications-api";
import { getUserProfile } from "../lib/profile-api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserAndNotifications = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No token found");

        const profile = await getUserProfile(token);

        const data = await fetchNotifications(profile._id);
        setNotifications(data);
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndNotifications();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRead = async (id: string, checked: boolean) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: checked } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 p-6 mt-11">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">My Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500 dark:text-white">No notifications yet.</p>
      ) : (
        <div className="grid gap-4">
          {notifications.map((n) => (
            <NotificationCard
              key={n._id}
              notification={n}
              onDelete={handleDelete}
              onToggleRead={handleToggleRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ Reusable Notification Card
function NotificationCard({
  notification,
  onDelete,
  onToggleRead,
}: {
  notification: Notification;
  onDelete: (id: string) => void;
  onToggleRead: (id: string, checked: boolean) => void;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-600 rounded-xl shadow-md p-4 flex justify-between items-center hover:shadow-lg transition ${
        notification.read ? "opacity-70" : ""
      }`}
    >
      <div>
        <p className="text-gray-800 dark:text-white">{notification.message}</p>
        <p className="text-xs text-gray-400 dark:text-white mt-1">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-4 items-center">
        {/* ✅ Checkbox to toggle read */}
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={notification.read}
            onChange={(e) => onToggleRead(notification._id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Read
        </label>

        <button
          onClick={() => onDelete(notification._id)}
          className="text-red-500 hover:text-red-700 text-sm font-semibold"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
