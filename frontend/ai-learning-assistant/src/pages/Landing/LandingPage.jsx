import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Target, Repeat, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden relative flex flex-col selection:bg-emerald-500/30">
      
      {/* Custom Keyframe for the Center Expansion Reveal */}
      <style>{`
        @keyframes expandCenter {
          0% { 
            transform: scale(0.6); 
            opacity: 0; 
            filter: blur(8px);
          }
          100% { 
            transform: scale(1); 
            opacity: 1; 
            filter: blur(0px);
          }
        }
        .animate-expand-center {
          animation: expandCenter 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: center center;
          will-change: transform, opacity, filter;
        }
      `}</style>

      {/* Static Background Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)'
        }}
      />

      {/* Static Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] md:top-[-20%] left-[5%] md:left-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-500/15 rounded-full blur-[100px] md:blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] md:bottom-[-20%] right-[5%] md:right-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-cyan-500/15 rounded-full blur-[100px] md:blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      {/* MASTER CONTENT WRAPPER 
        This div holds the Nav, Main, and Footer and applies the expand-center animation
      */}
      <div className="relative z-10 flex-1 flex flex-col w-full h-full animate-expand-center">
        
        {/* Navigation Bar */}
        <nav className="w-full max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <BrainCircuit className="text-emerald-400 w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.5}/>
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-white whitespace-nowrap group-hover:text-emerald-50 transition-colors">
              AI Learning
              <span className="hidden sm:inline"> Assistant</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <Link to="/login" className="text-xs md:text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold bg-white/10 border border-white/10 text-white rounded-lg md:rounded-xl hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.05)] whitespace-nowrap">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Main Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-0 text-center md:-mt-8">
          
          {/* Prominent 'Made by Krish' Badge */}
          <div className="relative inline-flex items-center justify-center mb-6 md:mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-md opacity-40 group-hover:opacity-70 group-hover:blur-xl transition-all duration-500 animate-pulse" />
            
            <div className="relative inline-flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-2.5 rounded-full bg-zinc-950 border border-white/10 group-hover:border-emerald-500/50 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)]">
              <Sparkles className="text-emerald-400 w-3 h-3 md:w-4 md:h-4 group-hover:animate-spin" style={{ animationDuration: '3s' }} />
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Engineered by
                </span>
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                  Krish
                </span>
              </div>
            </div>
          </div>

          {/* Massive Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-white mb-4 md:mb-6 animate-in fade-in zoom-in-95 duration-1000 delay-500 fill-mode-both leading-[1.1]">
            Supercharge Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              Study Sessions
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-700 fill-mode-both px-2">
            Upload any PDF and instantly generate interactive quizzes, smart flashcards, and concept summaries.
          </p>

          {/* Cascading Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-10 md:mb-14">
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-[900ms] fill-mode-both">
              <FeaturePill icon={<BookOpen size={16} className="text-emerald-400 md:w-[18px] md:h-[18px]"/>} text="Smart Summaries" />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-[1100ms] fill-mode-both">
              <FeaturePill icon={<Target size={16} className="text-emerald-400 md:w-[18px] md:h-[18px]"/>} text="Adaptive Quizzes" />
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-[1300ms] fill-mode-both">
              <FeaturePill icon={<Repeat size={16} className="text-emerald-400 md:w-[18px] md:h-[18px]"/>} text="Instant Flashcards" />
            </div>
          </div>

          {/* The Shine CTA Button */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[1500ms] fill-mode-both w-full sm:w-auto">
            <Link to="/register" className="relative group overflow-hidden w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-emerald-500 text-black rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] md:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)]">
              
              {/* The sweeping light effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none" 
                   style={{ animationName: 'sweep', animationDuration: '2s', animationIterationCount: 'infinite' }} />
              
              <style>{`
                @keyframes sweep {
                  0% { transform: translateX(-200%) skewX(-15deg); }
                  100% { transform: translateX(200%) skewX(-15deg); }
                }
              `}</style>

              <span className="relative z-10">Start Learning for Free</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1.5 transition-transform md:w-[22px] md:h-[22px]" />
            </Link>
          </div>

        </main>

        {/* Minimal Footer */}
        <footer className="w-full max-w-7xl mx-auto px-6 h-16 md:h-20 shrink-0 flex items-center justify-center text-zinc-600 text-[10px] md:text-xs font-medium uppercase tracking-widest animate-in fade-in duration-1000 delay-[1800ms] fill-mode-both">
          <p>Built with MERN & AI</p>
        </footer>

      </div>
    </div>
  );
};

// Float and glow on hover
const FeaturePill = ({ icon, text }) => (
  <div className="flex items-center gap-2 md:gap-3 px-4 py-2.5 md:px-5 md:py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.2)] transition-all duration-300 backdrop-blur-md cursor-default">
    {icon}
    <span className="text-xs md:text-sm font-medium text-zinc-200">{text}</span>
  </div>
);

export default LandingPage;