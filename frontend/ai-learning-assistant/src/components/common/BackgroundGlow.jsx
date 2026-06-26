import React from 'react';

const BackgroundGlow = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
      {/* Emerald Glow */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" 
        style={{ animationDuration: '4s' }} 
      />
      {/* Cyan Glow */}
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" 
        style={{ animationDuration: '6s' }} 
      />
    </div>
  );
};

export default BackgroundGlow;