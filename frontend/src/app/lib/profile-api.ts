export type UserProfile = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getUserProfile(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch user profile");
  }

  return res.json();
}

export async function updateUserProfile(
  token: string,
  data: Partial<Pick<UserProfile, "name" | "email" | "role">>
): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update profile");
  }

  const result = await res.json();
  return result.user;
}
