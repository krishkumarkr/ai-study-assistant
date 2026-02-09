import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden relative">

      <div className="absolute top-0 -left-10 w-125 h-125 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-10 w-125 h-125 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-size-[32px_32px] opacity-[0.02] pointer-events-none" />

      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden z-10">

        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
