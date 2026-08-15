import React, { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import authService from "../../services/authService";
import toast from "react-hot-toast";
// Added Activity icon here
import { User, Mail, Lock, ShieldCheck, Key, Activity } from "lucide-react"; 
import BackgroundGlow from "../../components/common/BackgroundGlow";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  // NEW: State for Limits
  const [aiUsage, setAiUsage] = useState(null);
  const [limits, setLimits] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authService.getProfile();
        setUsername(data.username);
        setEmail(data.email);
        
        // NEW: Grab the limits from the backend response
        if (data.aiUsage && data.limits) {
            setAiUsage(data.aiUsage);
            setLimits(data.limits);
        }
      } catch (error) {
        toast.error(error.error || error.message || "Failed to fetch profile data.");
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
      toast.error(error.error || error.message || "Failed to change password.");
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

          {/* NEW: AI Generation Limits - Full width row */}
          {aiUsage && limits && (
            <div className="lg:col-span-12 bg-white/2 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Activity size={18} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">AI Generation Limits</h3>
                <div className="ml-auto flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Resets every 24H</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 relative z-10">
                {[
                  { label: 'Chat Queries', used: aiUsage.chats, max: limits.chats },
                  { label: 'Document Summaries', used: aiUsage.summaries, max: limits.summaries },
                  { label: 'Flashcard Sets', used: aiUsage.flashcards, max: limits.flashcards },
                  { label: 'Quizzes Generated', used: aiUsage.quizzes, max: limits.quizzes },
                  { label: 'Concept Explanations', used: aiUsage.explanations, max: limits.explanations }
                ].map((stat, index) => {
                  const percent = Math.min(100, Math.round((stat.used / stat.max) * 100));
                  const isMaxed = stat.used >= stat.max;

                  return (
                    <div key={index} className="w-full">
                      <div className="flex justify-between items-center text-xs font-medium mb-3">
                        <span className="text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</span>
                        <span className={isMaxed ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                          {stat.used} <span className="text-zinc-600 font-medium">/ {stat.max}</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isMaxed 
                              ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                              : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ProfilePage;