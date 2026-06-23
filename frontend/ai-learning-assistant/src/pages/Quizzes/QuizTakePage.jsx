import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);

        if (response.data.completedAt) {
            navigate(`/quizzes/${quizId}/results`, { replace: true });
            return;
        }

        setQuiz(response.data);
      } catch (error) {
        toast.error("Failed to fetch quiz.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleOptionToggle = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };
      
      // If they click the one that's already selected, delete it (unselect)
      if (newAnswers[questionId] === optionIndex) {
        delete newAnswers[questionId];
      } else {
        // Otherwise, select it
        newAnswers[questionId] = optionIndex;
      }
      
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = [];
      
      // FIX: We ONLY send the questions you actually clicked an answer for.
      // This prevents MongoDB from throwing a 400 Validation Error on fake/skipped strings!
      quiz.questions.forEach((question, index) => {
        const optionIndex = selectedAnswers[question._id];
        
        if (optionIndex !== undefined) {
          formattedAnswers.push({
            questionIndex: index,
            selectedAnswer: question.options[optionIndex]
          });
        }
      });

      await quizService.submitQuiz(quizId, formattedAnswers);
      toast.success("Quiz submitted successfully!");
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      // Improved error logging: This will print the EXACT backend database error if it fails
      const backendError = error.response?.data?.error || error.message;
      toast.error(backendError || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <p className="text-zinc-500 font-bold tracking-widest uppercase">
          Quiz not found or has no questions.
        </p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader title={quiz.title || "Take Quiz"} />

      {/* Progress Bar */}
      <div className="bg-white/2 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-white tracking-tight">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">
            {answeredCount} answered
          </span>
        </div>
        <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{
              width: `${(answeredCount / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white/2 border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl mb-8">
          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="text-xs font-bold text-zinc-300 tracking-widest uppercase">
            Question {currentQuestionIndex + 1}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed tracking-tight">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion._id] === index;
            return (
              <div
                key={index}
                onClick={() => handleOptionToggle(currentQuestion._id, index)}
                className={`group relative flex items-center p-4 md:p-5 border rounded-2xl cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {/* Note: The hidden <input type="radio"> is completely gone now! */}

                {/* Custom Radio Button */}
                <div
                  className={`shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-zinc-600 bg-zinc-900 group-hover:border-emerald-400/50"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 bg-black rounded-full" />
                  )}
                </div>

                {/* Option Text */}
                <span
                  className={`ml-4 text-sm md:text-base font-medium transition-colors duration-300 ${
                    isSelected ? "text-emerald-50" : "text-zinc-300 group-hover:text-white"
                  }`}
                >
                  {option}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || submitting}
          className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all disabled:opacity-30 disabled:hover:bg-white/5 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          Previous
        </button>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting} 
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                Submit Quiz
              </>
            )}
          </button>
        ) : (
          <button 
            onClick={handleNextQuestion} 
            disabled={submitting}
            className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl font-bold text-sm transition-all flex items-center gap-2 active:scale-[0.98]"
          >
            Next
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Question Navigation Dots */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-white/5">
        {quiz.questions.map((_, index) => {
          const isAnsweredQuestion = selectedAnswers.hasOwnProperty(quiz.questions[index]._id);
          const isCurrent = index === currentQuestionIndex;

          return (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              disabled={submitting}
              className={`w-10 h-10 rounded-xl font-bold text-xs transition-all duration-300 ${
                isCurrent
                  ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110"
                  : isAnsweredQuestion
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                  : "bg-white/5 border border-white/5 text-zinc-500 hover:bg-white/10 hover:text-white"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizTakePage;