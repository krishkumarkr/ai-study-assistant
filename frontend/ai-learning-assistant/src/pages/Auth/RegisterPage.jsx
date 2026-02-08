import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { BrainCircuit, User, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await authService.register(username, email, password);
      toast.success("Registered successfully! Please Login");
      navigate("/login");
    } catch (err) {
      setError(err.error || "Failed to register. Please try again.");
      toast.error(err.error || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-zinc-950 overflow-hidden">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-size-[32px_32px] opacity-[0.03] pointer-events-none" />

      <div className="relative w-full max-w-md px-8">
        <div className="bg-white/2 backdrop-blur-2xl border border-white/10 rounded-4xl shadow-2xl shadow-black/50 px-7 py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 mb-6">
              <BrainCircuit className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Create an Account
            </h1>
            <p className="text-zinc-500 text-sm">
              Start your AI-powered learning experience
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {/* Username field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Username
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === "username"
                      ? "text-emerald-400"
                      : "text-zinc-600"
                  }`}
                >
                  <User className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={(e) => setFocusedField("username")}
                  onBlur={(e) => setFocusedField(null)}
                  className="w-full h-11 pl-12 pr-4 border border-white/5 rounded-2xl bg-white/3 text-white text-sm transition-all duration-300 focus:outline-none focus:border-emerald-500/50 focus:bg-white/5 focus:ring-4 focus:ring-emerald-500/5"
                  placeholder="your_username"
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === "email"
                      ? "text-emerald-400"
                      : "text-zinc-600"
                  }`}
                >
                  <Mail className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => setFocusedField("email")}
                  onBlur={(e) => setFocusedField(null)}
                  className="w-full h-11 pl-12 pr-4 border border-white/5 rounded-2xl bg-white/3 text-white text-sm transition-all duration-300 focus:outline-none focus:border-emerald-500/50 focus:bg-white/5 focus:ring-4 focus:ring-emerald-500/5"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    focusedField === "password"
                      ? "text-emerald-400"
                      : "text-zinc-600"
                  }`}
                >
                  <Lock className="h-5 w-5" strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => setFocusedField("password")}
                  onBlur={(e) => setFocusedField(null)}
                  className="w-full h-11 pl-12 pr-4 border border-white/5 rounded-2xl bg-white/3 text-white text-sm transition-all duration-300 focus:outline-none focus:border-emerald-500/50 focus:bg-white/5 focus:ring-4 focus:ring-emerald-500/5"
                  placeholder=". . . . . . ."
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-[11px] text-red-400 font-semibold text-center uppercase tracking-wide">
                  {error}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="group relative w-full h-13 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-white text-sm font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-xl shadow-emerald-500/20 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-[10px] font-medium text-zinc-600 uppercase tracking-[0.2em] mt-5">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
