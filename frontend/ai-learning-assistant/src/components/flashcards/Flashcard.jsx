import { useState } from "react";
import { Star, RotateCcw } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="w-full h-[400px] md:h-[450px]" style={{ perspective: "1000px" }}>
            <div
                className={`relative w-full h-full transition-transform duration-700 transform-gpu cursor-pointer`}
                style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
                onClick={handleFlip}
            >
                {/* Front of the card (Question) */}
                <div
                    className="absolute inset-0 w-full h-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl p-8 flex flex-col justify-between"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="bg-white/5 border border-white/5 text-[10px] font-bold text-zinc-400 tracking-widest rounded-lg px-3 py-1.5 uppercase">
                            {flashcard?.difficulty || "Normal"}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(flashcard._id);
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                flashcard.isStarred
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                    : "bg-white/5 border border-white/5 text-zinc-500 hover:bg-white/10 hover:text-amber-400"
                            }`}
                        >
                            <Star
                                className="w-5 h-5"
                                strokeWidth={2}
                                fill={flashcard.isStarred ? "currentColor" : "none"}
                            />
                        </button>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 flex items-center justify-center px-4 py-6">
                        <p className="text-xl md:text-2xl font-bold text-white text-center leading-relaxed tracking-tight">
                            {flashcard.question}
                        </p>
                    </div>

                    {/* Flip Indicator */}
                    <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-widest">
                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <span>Click to reveal answer</span>
                    </div>
                </div>

                {/* Back of the card (Answer) */}
                <div
                    className="absolute inset-0 w-full h-full bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-[32px] shadow-2xl shadow-emerald-500/10 p-8 flex flex-col justify-between"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="bg-emerald-500/20 text-[10px] font-bold text-emerald-400 tracking-widest rounded-lg px-3 py-1.5 uppercase">
                            Answer
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(flashcard._id);
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                flashcard.isStarred
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                    : "bg-white/5 border border-white/5 text-emerald-500/50 hover:bg-white/10 hover:text-amber-400"
                            }`}
                        >
                            <Star
                                className="w-5 h-5"
                                strokeWidth={2}
                                fill={flashcard.isStarred ? "currentColor" : "none"}
                            />
                        </button>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1 flex items-center justify-center px-4 py-6 overflow-y-auto custom-scrollbar">
                        <p className="text-lg text-emerald-50 text-center leading-relaxed font-medium">
                            {flashcard.answer}
                        </p>
                    </div>

                    {/* Flip Indicator */}
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-500/50 font-bold uppercase tracking-widest mt-4">
                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <span>Click to see question</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flashcard;