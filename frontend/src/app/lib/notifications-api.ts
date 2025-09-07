export type Notification = {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const res = await fetch(`${API_BASE}/notifications/user/${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function markAsRead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ read: true }),
  });
  if (!res.ok) throw new Error("Failed to mark as read");
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete notification");
}
