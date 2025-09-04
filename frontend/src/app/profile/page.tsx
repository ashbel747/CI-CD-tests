// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getUserProfile } from '../lib/profile-api';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('accessToken'); // adjust based on where you store it
        if (!token) throw new Error('No token found');

        const data = await getUserProfile(token);
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  if (!user) return <p className="p-4">Could not load profile</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="space-y-2">
        <p><strong>ID:</strong> {user._id}</p>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
  user.role === 'seller' 
    ? 'bg-blue-100 text-blue-800' 
    : 'bg-green-100 text-green-800'
}`}>
  {user.role ? String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1) : 'N/A'}
</span>

        </p>
      </div>
      
      {/* Role-specific content */}
      {user.role === 'seller' && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold text-blue-800">Seller Dashboard</h3>
          <p className="text-sm text-blue-600">Manage your products and orders</p>
        </div>
      )}
      
      {user.role === 'buyer' && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <h3 className="font-semibold text-green-800">Buyer Profile</h3>
          <p className="text-sm text-green-600">Browse and purchase products</p>
        </div>
      )}
    </div>
  );
}
