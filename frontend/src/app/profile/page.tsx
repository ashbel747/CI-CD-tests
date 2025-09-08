// app/profile/page.tsx
'use client';

import { useEffect } from 'react';
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
import { useAuth } from '../context/authContext'

export default function ProfilePage() {
  const { user, loading, getUserProfile, logout } = useAuth();

  useEffect(() => {
    // If user is authenticated but profile not loaded, fetch it
    if (user?.isAuthenticated && !user?.userProfile) {
      getUserProfile();
    }
  }, [user?.isAuthenticated, user?.userProfile, getUserProfile]);

  const handleLogout = (): void => {
    logout(); // AuthContext handles all cleanup and navigation
  };

  if (loading) return <p className="p-4">Loading...</p>;

  if (!user?.isAuthenticated || !user?.userProfile) {
    return <p className="p-4">Could not load profile</p>;
  }

  const userProfile = user.userProfile;

  const menuItems = [
    { icon: <Bell size={20} />, label: 'Notification', href: `/notifications` },
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
          Name: {userProfile.name}
        </h2>
        <p className="text-2xl text-black dark:text-white mt-1">Email: {userProfile.email}</p>
        <p className="text-2xl text-black dark:text-white mt-1">Role: {userProfile.role}</p>
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
          <Link href={`/wishlist/${userProfile._id}`} className="text-sm mt-2 text-white">
            My wishlist
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <IdCard size={24} className="text-white" />
          <Link href={`/orders/${userProfile._id}`} className="text-sm mt-2 text-white">
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