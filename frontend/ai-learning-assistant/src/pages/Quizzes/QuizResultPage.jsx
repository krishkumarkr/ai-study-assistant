import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
  MinusCircle
} from "lucide-react";
import BackgroundGlow from "../../components/common/BackgroundGlow";

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setResults(data);
      } catch (error) {
        toast.error("Failed to fetch quiz results.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

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

  if (!results || !results.data) {
    return (
      <>
        <BackgroundGlow />
        <div className="relative z-10 flex items-center justify-center min-h-[60vh] text-center">
          <p className="text-zinc-500 font-bold tracking-widest uppercase">Quiz results not found.</p>
        </div>
      </>
    );
  }

  const { data: { quiz, results: detailedResults } } = results;

  const score = quiz.score;
  const totalQuestions = detailedResults.length;
  const correctAnswers = detailedResults.filter((r) => r.isCorrect).length;
  const skippedAnswers = detailedResults.filter((r) => !r.selectedAnswer || r.selectedAnswer === "Not Answered").length;
  const incorrectAnswers = totalQuestions - correctAnswers - skippedAnswers;

  const getScoreColor = (score) => {
    if (score >= 80) return "from-emerald-400 to-teal-400";
    if (score >= 60) return "from-amber-400 to-yellow-500";
    return "from-rose-400 to-red-500";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Outstanding!";
    if (score >= 80) return "Great job!";
    if (score >= 70) return "Good work!";
    if (score >= 60) return "Not bad!";
    return "Keep practicing!";
  };

  const normalizeText = (str) => String(str).replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ").trim().toLowerCase();

  return (
    <>
      <BackgroundGlow />
      {/* Added responsive padding so it doesn't hug the screen edges on mobile */}
      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6 md:space-y-8 px-2 sm:px-4 md:px-0 pt-2 pb-12 animate-in fade-in duration-500">
        
        {/* Back Button */}
        <div>
          <Link
            to={`/documents/${quiz.document._id}`}
            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-zinc-500 hover:text-emerald-400 transition-all uppercase tracking-widest group"
          >
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white/5 border border-white/5 group-hover:border-emerald-500/30 transition-all">
              <ArrowLeft size={16} className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            Back to Document
          </Link>
        </div>

        <PageHeader title={`${quiz.title || "Quiz"} Results`} />

        {/* Score Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl md:rounded-[40px] shadow-2xl p-6 md:p-10 relative overflow-hidden">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b ${getScoreColor(score)} opacity-5 blur-[100px] pointer-events-none`} />

          <div className="text-center space-y-6 md:space-y-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-inner">
              <Trophy className="w-8 h-8 md:w-10 md:h-10 text-amber-400" strokeWidth={2} />
            </div>

            <div>
              <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Your Score
              </p>
              <div className={`inline-block text-5xl md:text-7xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent tracking-tighter`}>
                {score}%
              </div>
              <p className="text-zinc-400 font-medium mt-3 md:mt-4 text-sm md:text-lg">
                {getScoreMessage(score)}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-6 md:pt-8 border-t border-white/5 max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl">
                <Target className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" strokeWidth={2} />
                <span className="text-xs md:text-sm font-bold text-zinc-300">
                  {totalQuestions} <span className="text-zinc-500 font-normal">Total</span>
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl md:rounded-2xl">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" strokeWidth={2} />
                <span className="text-xs md:text-sm font-bold text-emerald-50">
                  {correctAnswers} <span className="text-emerald-500 font-normal">Correct</span>
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl md:rounded-2xl">
                <XCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-400" strokeWidth={2} />
                <span className="text-xs md:text-sm font-bold text-rose-50">
                  {incorrectAnswers} <span className="text-rose-500 font-normal">Wrong</span>
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-zinc-800 border border-white/5 rounded-xl md:rounded-2xl">
                <MinusCircle className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" strokeWidth={2} />
                <span className="text-xs md:text-sm font-bold text-zinc-300">
                  {skippedAnswers} <span className="text-zinc-500 font-normal">Skipped</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-4 md:space-y-6 pt-6 md:pt-8">
          <div className="flex items-center gap-3 px-1">
            <BookOpen className="text-emerald-400" size={20} strokeWidth={2} />
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Detailed Review</h3>
          </div>

          <div className="space-y-4 md:space-y-6">
            {detailedResults.map((result, index) => {
              const isCorrect = result.isCorrect;
              const isSkipped = !result.selectedAnswer || result.selectedAnswer === "Not Answered";
              const dbCorrectAnswer = String(result.correctAnswer || "").trim().toLowerCase();

              // Finding correct index logic
              let correctIndex = -1;
              let idx = result.options.findIndex(opt => normalizeText(opt) === normalizeText(dbCorrectAnswer));
              if (idx !== -1) {
                correctIndex = idx;
              } else {
                idx = result.options.findIndex(opt => {
                  const cleanOpt = normalizeText(opt);
                  const cleanDb = normalizeText(dbCorrectAnswer);
                  return cleanOpt.length > 0 && (cleanDb.includes(cleanOpt) || cleanOpt.includes(cleanDb));
                });
                if (idx !== -1) correctIndex = idx;
                else if (dbCorrectAnswer.includes("option")) {
                  const numMatch = dbCorrectAnswer.match(/\d+/);
                  if (numMatch) correctIndex = parseInt(numMatch[0]) - 1;
                  else {
                    const charMatch = dbCorrectAnswer.match(/[a-d]/);
                    if (charMatch) correctIndex = charMatch[0].charCodeAt(0) - 97;
                  }
                } else if (dbCorrectAnswer.length === 1 && /[a-d]/.test(dbCorrectAnswer)) {
                  correctIndex = dbCorrectAnswer.charCodeAt(0) - 97;
                } else if (/^\d+$/.test(dbCorrectAnswer)) {
                  const num = parseInt(dbCorrectAnswer);
                  if (num > 0 && num <= result.options.length) correctIndex = num - 1;
                  else if (num === 0) correctIndex = 0;
                } else if (isCorrect && !isSkipped) {
                  correctIndex = result.options.findIndex(opt => opt === result.selectedAnswer);
                }
              }

              const userIndex = result.options.findIndex(opt => opt === result.selectedAnswer);

              return (
                <div
                  key={index}
                  className="bg-white/2 backdrop-blur-xl border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-8"
                >
                  
                  {/* CRITICAL FIX 1: Header Layout. 
                    Moved the big icon inline with the Question tag on mobile so the text gets 100% width.
                  */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-6">
                    <div className="w-full">
                      <div className="flex items-center justify-between sm:justify-start gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg">
                            Question {index + 1}
                          </span>
                          {isSkipped && (
                            <span className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest bg-zinc-800 border border-white/5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg">
                              Skipped
                            </span>
                          )}
                        </div>

                        {/* Mobile Icon (Hidden on Desktop) */}
                        <div className={`sm:hidden shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-inner ${
                          isCorrect ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : 
                          isSkipped ? "bg-zinc-800 border-zinc-700 text-zinc-400" : 
                          "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}>
                          {isCorrect ? <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} /> : 
                           isSkipped ? <MinusCircle className="w-4 h-4" strokeWidth={2.5} /> : 
                           <XCircle className="w-4 h-4" strokeWidth={2.5} />}
                        </div>
                      </div>
                      
                      <h4 className="text-base md:text-lg font-bold text-white leading-relaxed tracking-tight w-full">
                        {result.question}
                      </h4>
                    </div>

                    {/* Desktop Icon (Hidden on Mobile) */}
                    <div className={`hidden sm:flex shrink-0 w-12 h-12 rounded-2xl items-center justify-center border shadow-inner ${
                      isCorrect ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : 
                      isSkipped ? "bg-zinc-800 border-zinc-700 text-zinc-400" : 
                      "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} /> : 
                       isSkipped ? <MinusCircle className="w-6 h-6" strokeWidth={2.5} /> : 
                       <XCircle className="w-6 h-6" strokeWidth={2.5} />}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5 md:space-y-3">
                    {result.options.map((option, optIndex) => {
                      const isCorrectOption = optIndex === correctIndex;
                      const isUserAnswer = optIndex === userIndex;
                      const isWrongAnswer = isUserAnswer && !isCorrectOption && !isSkipped;

                      return (
                        <div
                          key={optIndex}
                          className={`relative px-4 py-3 md:px-5 md:py-4 rounded-xl md:rounded-2xl border transition-all duration-300 ${
                            isCorrectOption
                              ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                              : isWrongAnswer
                                ? "bg-rose-500/10 border-rose-500/30"
                                : "bg-white/5 border-white/5 opacity-50"
                          }`}
                        >
                          {/* CRITICAL FIX 2: flex-col on mobile, flex-row on desktop. 
                            This stops the tags from squishing the option text! 
                          */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                            <span className={`text-sm md:text-base leading-relaxed font-medium ${
                                isCorrectOption ? "text-emerald-50" : 
                                isWrongAnswer ? "text-rose-50" : "text-zinc-400"
                              }`}
                            >
                              {option}
                            </span>
                            
                            <div className="shrink-0 flex flex-wrap items-center self-start sm:self-auto gap-2">
                              {isCorrectOption && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-emerald-400 whitespace-nowrap">
                                  <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={2.5} />
                                  {isUserAnswer ? "Your Answer (Correct)" : "Correct answer"}
                                </span>
                              )}
                              {isWrongAnswer && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 rounded-lg text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-rose-400 whitespace-nowrap">
                                  <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={2.5} />
                                  Your answer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {result.explanation && (
                    <div className="mt-5 md:mt-6 p-4 md:p-5 bg-zinc-950/50 border border-white/5 rounded-xl md:rounded-2xl">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                          <BookOpen className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                        </div>
                        <div className="flex-1 pt-0.5 md:pt-1">
                          <p className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 md:mb-1.5">
                            Explanation
                          </p>
                          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                            {result.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizResultPage;