"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useAuth, UserProfile } from '../../context/authContext'

export default function UpdateProfileForm() {
  const { user, loading, updateUserProfile, getUserProfile, error, clearError } = useAuth();
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      // If user is authenticated but profile not loaded, fetch it
      if (user?.isAuthenticated && !user?.userProfile) {
        await getUserProfile();
      }
      
      // Set form data from user profile
      if (user?.userProfile) {
        setFormData(user.userProfile);
      }
    };

    loadProfile();
  }, [user, getUserProfile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setUpdating(true);
      clearError();
      setSuccess(null);

      await updateUserProfile({
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });

      setSuccess("Profile updated successfully ✅");
      
      // Navigate back to profile page
      setTimeout(() => {
        router.push("/profile");
      }, 1500);

    } catch (err: unknown) {
      // Error is already handled by AuthContext
      console.error("Profile update failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Show loading if auth is loading or no user data yet
  if (loading || !user?.isAuthenticated || !formData) {
    return <p className="text-center py-4 text-white">Loading profile...</p>;
  }

  return (
    <div className="min-h-screen bg-[#332a2c] text-white p-4">
      <div className="flex items-center justify-between p-4 pt-8">
        <h1 className="text-xl font-semibold absolute left-1/2 -translate-x-1/2">
          Update Profile
        </h1>
      </div>
      
      <div className="flex flex-col items-center py-8">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#F3E0DB]">
          <User className="w-full h-full object-cover" />
        </div>

        <div className="mt-4">
          <h2 className="text-2xl font-bold text-center">{formData.name}</h2>
          <p className="text-sm text-gray-400 text-center">{formData.email}</p>
        </div>
      </div>
      
      <div className="bg-[#241e21] rounded-t-3xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => prev && { ...prev, name: e.target.value })
                }
                className="w-full bg-[#3e3538] border border-transparent rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                placeholder="Madison Smith"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData((prev) => prev && { ...prev, email: e.target.value })
                }
                className="w-full bg-[#3e3538] border border-transparent rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                placeholder="Madisons@Example.Com"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-1">Role</label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="radio"
                    id="buyer"
                    name="role"
                    value="buyer"
                    checked={formData.role === "buyer"}
                    onChange={(e) =>
                      setFormData((prev) => prev && { ...prev, role: e.target.value as 'buyer' | 'seller' })
                    }
                    className="hidden peer"
                  />
                  <label
                    htmlFor="buyer"
                    className="block text-center py-3 rounded-lg border border-gray-600 bg-[#3e3538] cursor-pointer peer-checked:bg-[#3F2E31] transition-colors"
                  >
                    Buyer
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="radio"
                    id="seller"
                    name="role"
                    value="seller"
                    checked={formData.role === "seller"}
                    onChange={(e) =>
                      setFormData((prev) => prev && { ...prev, role: e.target.value as 'buyer' | 'seller' })
                    }
                    className="hidden peer"
                  />
                  <label
                    htmlFor="seller"
                    className="block text-center py-3 rounded-lg border border-gray-600 bg-[#3e3538] cursor-pointer peer-checked:bg-[#3F2E31] transition-colors"
                  >
                    Seller
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={updating}
            className="w-full bg-[#3F2E31] text-white py-4 rounded-xl mt-6 font-semibold disabled:opacity-50 hover:bg-pink-600 transition-colors"
          >
            {updating ? "Updating..." : "Update Profile"}
          </button>
        </form>
        
        {success && <p className="text-green-400 mt-4 text-center text-sm">{success}</p>}
        {error && <p className="text-red-400 mt-4 text-center text-sm">{error}</p>}
      </div>
    </div>
  );
}