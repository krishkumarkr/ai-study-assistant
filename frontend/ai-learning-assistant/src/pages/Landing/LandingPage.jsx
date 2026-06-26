import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Target, Repeat, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

const LandingPage = () => {
  return (
    // 'h-screen' and 'overflow-hidden' guarantee there is zero scrolling
    <div className="h-screen w-full bg-black text-white overflow-hidden relative flex flex-col selection:bg-emerald-500/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 h-24 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <BrainCircuit className="text-emerald-400" size={22} strokeWidth={2.5}/>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            AI Learning Assistant
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="px-6 py-2.5 text-sm font-bold bg-white text-black rounded-xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Hero Section (Perfectly Centered) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center -mt-12">
        
        {/* Prominent 'Made by Krish' Badge */}
        <div className="relative inline-flex items-center justify-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 group cursor-default">
          {/* Animated glowing backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-md opacity-30 group-hover:opacity-60 group-hover:blur-lg transition-all duration-500 animate-pulse" />
          
          {/* Badge Content */}
          <div className="relative inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-zinc-950/80 border border-white/10 group-hover:border-emerald-500/40 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1">
            <Sparkles size={16} className="text-emerald-400 animate-pulse" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Engineered by
              </span>
              <span className="text-sm font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                Krish
              </span>
            </div>
          </div>
        </div>

        {/* Massive Headline */}
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
          Supercharge Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Study Sessions
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          Upload any PDF and instantly generate interactive quizzes, smart flashcards, and concept summaries.
        </p>

        {/* Horizontal Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-14 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <FeaturePill icon={<BookOpen size={18} className="text-emerald-400"/>} text="Smart Summaries" />
          <FeaturePill icon={<Target size={18} className="text-emerald-400"/>} text="Adaptive Quizzes" />
          <FeaturePill icon={<Repeat size={18} className="text-emerald-400"/>} text="Instant Flashcards" />
        </div>

        {/* Giant CTA Button */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 fill-mode-both">
          <Link to="/register" className="group px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)]">
            Start Learning for Free
            <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 h-20 shrink-0 flex items-center justify-center text-zinc-600 text-xs font-medium uppercase tracking-widest">
        <p>Built with MERN & AI</p>
      </footer>
      
    </div>
  );
};

// Sleek Pill Component for Features
const FeaturePill = ({ icon, text }) => (
  <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md">
    {icon}
    <span className="text-sm font-medium text-zinc-200">{text}</span>
  </div>
);

export default LandingPage;