import React from 'react';

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full relative">
      {/* Scrollable Tab Navigation */}
      <div className="relative w-full border-b border-white/5 mb-6 md:mb-8">
        
        {/* RESTORED: Gradient fade overlay to indicate more tabs */}
        <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-r from-transparent to-zinc-950 pointer-events-none z-10" />

        <div 
          className="flex overflow-x-auto gap-2 sm:gap-4 pb-4 px-1 scroll-smooth" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.flex::-webkit-scrollbar { display: none; }`}</style>
          
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                // outline-none & border-transparent ensure NO white ghost borders appear on focus/click
                className={`relative shrink-0 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-300 outline-none focus:outline-none border border-transparent ${
                  isActive
                    ? "text-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                {tab.label}
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-emerald-400 rounded-t-full shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {tabs.find((tab) => tab.name === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;