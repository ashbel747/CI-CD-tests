// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getUserProfile } from '../lib/profile-api';
import {
  Pencil,
  User,
  Tag,
  Scroll,
  IdCard,
  Bell,
  Settings,
  Bot,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

// Define a User type based on your backend response
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('No token found');

        const data: UserProfile = await getUserProfile(token);
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleLogout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setUser(null);
    window.location.href = '/';
  };

  if (loading) return <p className="p-4">Loading...</p>;

  if (!user) return <p className="p-4">Could not load profile</p>;

  const menuItems = [
    { icon: <Scroll size={20} />, label: 'Privacy Policy', href: `/privacy-policy` },
    { icon: <IdCard size={20} />, label: 'Payment Methods', href: `/payment-methods` },
    { icon: <Bell size={20} />, label: 'Notification', href: `/notifications` },
    { icon: <Settings size={20} />, label: 'Settings', href: `/settings` },
    { icon: <Bot size={20} />, label: 'Help', href: `/help` },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 text-black dark:text-white min-h-screen mt-11">
      <div className="flex justify-between items-center p-4">
        <ChevronLeft size={24} className="text-black dark:text-white" />
        <h1 className="text-xl font-bold text-pink-600">My Profile</h1>
        <Link href={`/profile/update`}>
          <Pencil size={24} className="text-pink-600" />
        </Link>
      </div>

      <div className="flex flex-col items-center mt-8">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#F3E0DB]">
          <User className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold mt-4 text-black dark:text-white">
          Name: {user.name}
        </h2>
        <p className="text-2xl text-black dark:text-white mt-1">Email: {user.email}</p>
        <p className="text-2xl text-black dark:text-white mt-1">Role: {user.role}</p>
      </div>

      <div className="flex justify-around p-4 mt-8 bg-[#3F2E31] rounded-lg mx-6 shadow-lg">
        <div className="flex flex-col items-center">
          <User size={24} className="text-white" />
          <Link href={`/profile`} className="text-sm mt-2 text-white">
            Profile
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <Tag size={24} className="text-white" />
          <Link href={`/wishlist/${user._id}`} className="text-sm mt-2 text-white">
            My wishlist
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <IdCard size={24} className="text-white" />
          <Link href={`/orders/${user._id}`} className="text-sm mt-2 text-white">
            My Orders
          </Link>
        </div>
      </div>

      <div className="mt-8 mx-6 space-y-4">
        {menuItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="p-3 bg-[#3F2E31] rounded-full text-[#F3E0DB]">{item.icon}</div>
            <Link href={item.href} className="text-base text-[#F3E0DB]">
              {item.label}
            </Link>
          </div>
        ))}
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-[#3F2E31] rounded-full text-[#F3E0DB]">
            <LogOut />
          </div>
          <button onClick={handleLogout} className="text-base text-[#F3E0DB]">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
