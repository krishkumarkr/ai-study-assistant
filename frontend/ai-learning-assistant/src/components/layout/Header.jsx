import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, User, Menu } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5 px-6">
      <div className="flex items-center justify-between h-full">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-emerald-400 hover:bg-white/5 transition-all duration-300"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="hidden lg:block"></div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300">
            <Bell size={20} strokeWidth={2} />

            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-zinc-950"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none mb-1">
                {user?.username || "User"}
            </p>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                {user?.email || "user@example.com"}
            </p>
            </div>

            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400/50 transition-all duration-300">
                <User size={18} strokeWidth={2.5} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
