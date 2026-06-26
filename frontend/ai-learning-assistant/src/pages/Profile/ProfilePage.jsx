import React, { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import authService from "../../services/authService";
import toast from "react-hot-toast";
import { User, Mail, Lock, ShieldCheck, Key } from "lucide-react";
import BackgroundGlow from "../../components/common/BackgroundGlow";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authService.getProfile();
        setUsername(data.username);
        setEmail(data.email);
      } catch (error) {
        toast.error("Failed to fetch profile data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast.error(error.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <BackgroundGlow />
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <Spinner />
        </div>
      </>
    );
  }

  // ... (keep all your imports and state logic the same)

  return (
    <>
      <BackgroundGlow />
      <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <PageHeader title="Profile Settings" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Account Details - Balanced sizing */}
          <div className="lg:col-span-5 bg-white/2 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-bold text-white tracking-tight mb-8 flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                <User size={18} strokeWidth={2} />
              </div>
              Account Details
            </h3>

            <div className="space-y-6 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-emerald-500/50" strokeWidth={2.5} />
                  </div>
                  <div className="w-full h-12 pl-11 pr-4 flex items-center border border-white/5 rounded-xl bg-zinc-900/50 text-sm font-medium text-zinc-300 shadow-inner">
                    {username}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-emerald-500/50" strokeWidth={2.5} />
                  </div>
                  <div className="w-full h-12 pl-11 pr-4 flex items-center border border-white/5 rounded-xl bg-zinc-900/50 text-sm font-medium text-zinc-300 shadow-inner">
                    {email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password - Balanced sizing */}
          <div className="lg:col-span-7 bg-white/2 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-bold text-white tracking-tight mb-8 flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                <Key size={18} strokeWidth={2} />
              </div>
              Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-500" strokeWidth={2} />
                  </div>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 pl-10 pr-4 border border-white/10 rounded-xl bg-black/20 text-sm text-white placeholder-zinc-600 transition-colors duration-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-zinc-500" strokeWidth={2} />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-12 pl-10 pr-4 border border-white/10 rounded-xl bg-black/20 text-sm text-white placeholder-zinc-600 transition-colors duration-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-zinc-500" strokeWidth={2} />
                    </div>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-12 pl-10 pr-4 border border-white/10 rounded-xl bg-black/20 text-sm text-white placeholder-zinc-600 transition-colors duration-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProfilePage;