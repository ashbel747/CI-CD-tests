"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "../../lib/profile-api";
import { User } from "lucide-react";

export default function UpdateProfileForm() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("Not authenticated");
        }
        const profile = await getUserProfile(token);
        setUser(profile);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const updatedUser = await updateUserProfile(token, {
        name: user.name,
        email: user.email,
        role: user.role,
      });

      setUser(updatedUser);
      setSuccess("Profile updated successfully ✅");

      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return <p className="text-center py-4 text-white">Loading profile...</p>;
  if (error)
    return <p className="text-red-500 text-center">{error}</p>;

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
          <h2 className="text-2xl font-bold text-center">{user?.name}</h2>
          <p className="text-sm text-gray-400 text-center">{user?.email}</p>
        </div>
      </div>
      <div className="bg-[#241e21] rounded-t-3xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={user?.name || ""}
                onChange={(e) =>
                  setUser((prev) => prev && { ...prev, name: e.target.value })
                }
                className="w-full bg-[#3e3538] border border-transparent rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                placeholder="Madison Smith"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                onChange={(e) =>
                  setUser((prev) => prev && { ...prev, email: e.target.value })
                }
                className="w-full bg-[#3e3538] border border-transparent rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                placeholder="Madisons@Example.Com"
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
                    checked={user?.role === "buyer"}
                    onChange={(e) =>
                      setUser((prev) => prev && { ...prev, role: e.target.value })
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
                    checked={user?.role === "seller"}
                    onChange={(e) =>
                      setUser((prev) => prev && { ...prev, role: e.target.value })
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