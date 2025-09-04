// lib/api.ts
export async function getUserProfile(token: string) {
  const res = await fetch("http://localhost:3000/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return res.json();
}
