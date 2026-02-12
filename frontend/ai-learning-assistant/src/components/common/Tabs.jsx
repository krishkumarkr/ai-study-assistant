import React from "react";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Tab Navigation Container */}
      <div className="border-b border-white/5">
        <nav className="flex gap-8 md:gap-8 overflow-x-auto scrollbar-hide no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`
                relative pb-4 px-2 md:px-6 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 outline-hidden whitespace-nowrap
                ${activeTab === tab.name 
                  ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' 
                  : 'text-zinc-500 hover:text-zinc-300'}
              `}
            >
              <span>{tab.label}</span>
              {activeTab === tab.name && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-in slide-in-from-left-full duration-300" />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {tabs.map((tab) => {
          if (tab.name === activeTab) {
            return (
              <div key={tab.name} className="min-h-50">
                {tab.content}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Tabs;
