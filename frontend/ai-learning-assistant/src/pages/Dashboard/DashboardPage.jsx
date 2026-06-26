import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import BackgroundGlow from "../../components/common/BackgroundGlow";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  ChevronRight
} from "lucide-react";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        setDashboardData(data.data);
      } catch (error) {
        toast.error("Failed to fetch dashboard data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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

  if (!dashboardData || !dashboardData.overview) {
    return (
      <>
        <BackgroundGlow />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="w-full max-w-md p-8 sm:p-10 rounded-4xl bg-white/2 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center mx-auto mb-5 border border-white/5 shadow-inner">
              <TrendingUp className="text-zinc-500 w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome to your Dashboard</h2>
            <p className="text-zinc-400 text-sm">Upload a document to start generating insights.</p>
          </div>
        </div>
      </>
    );
  }

  const stats = [
    {
      label: "Total Documents",
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: "from-blue-400 to-cyan-500",
      shadowColor: "shadow-blue-500/25",
    },
    {
      label: "Total Flashcards",
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
      shadowColor: "shadow-purple-500/25",
    },
    {
      label: "Total Quizzes",
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: "from-emerald-400 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
      // On tablet (md), we make the 3rd item span 2 columns to keep the grid balanced
      colSpan: "md:col-span-2 lg:col-span-1" 
    },
  ];

  return (
    <>
      <BackgroundGlow />
      
      {/* Main Container: Responsive spacing based on device size */}
      <div className="relative z-10 space-y-6 md:space-y-8 animate-in fade-in duration-700 w-full max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="px-1">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-1 md:mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-400 text-sm md:text-base font-medium">
            Track your learning progress and AI activity
          </p>
        </div>

        {/* Stats Grid: Mobile 1 col, Tablet 2 col, Desktop 3 col */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group relative bg-white/2 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 hover:bg-white/5 hover:border-white/10 transition-all duration-500 shadow-xl shadow-black/50 overflow-hidden ${stat.colSpan || ""}`}
            >
              {/* Subtle background glow on hover */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full`} />
              
              <div className="flex items-start justify-between mb-4 md:mb-6 relative z-10">
                <span className="text-[11px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                  {stat.label}
                </span>
                <div
                  className={`shrink-0 p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} ${stat.shadowColor} shadow-lg text-white transition-transform duration-300 group-hover:scale-110`}
                >
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-black text-white tracking-tighter relative z-10">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white/2 backdrop-blur-xl border border-white/5 rounded-3xl p-5 md:p-8 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 px-1">
            <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-emerald-400 shadow-inner">
              <Clock className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Recent Activity
            </h3>
          </div>

          {dashboardData.recentActivity &&
          (dashboardData.recentActivity.documents.length > 0 ||
            dashboardData.recentActivity.quizzes.length > 0) ? (
            <div className="space-y-3 md:space-y-4">
              {[
                ...(dashboardData.recentActivity.documents || []).map((doc) => ({
                  id: doc._id,
                  description: doc.title,
                  timestamp: doc.lastAccessed,
                  link: `/documents/${doc._id}`,
                  type: "document",
                })),

                ...(dashboardData.recentActivity.quizzes || []).map((quiz) => ({
                  id: quiz._id,
                  description: quiz.title || "Untitled Quiz",
                  timestamp: quiz.completedAt || quiz.createdAt,
                  link: `/quizzes/${quiz._id}/results`,
                  type: "quiz",
                })),
              ]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((activity, index) => (
                  <Link
                    to={activity.link || "#"}
                    key={activity.id || index}
                    className="group flex items-center justify-between gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-300"
                  >
                    {/* The min-w-0 is CRITICAL here to allow the text to truncate on all screens */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      
                      {/* Indicator Dot */}
                      <div
                        className={`shrink-0 w-2.5 h-2.5 rounded-full shadow-lg ${
                          activity.type === "document"
                            ? "bg-gradient-to-r from-blue-400 to-cyan-500 shadow-blue-500/30"
                            : "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-500/30"
                        }`}
                      />
                      
                      <div className="flex-1 min-w-0">
                        {/* truncate forces long titles to use ... instead of breaking the layout */}
                        <p className="text-sm md:text-base font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                          <span className="text-zinc-500 font-normal hidden md:inline">
                            {activity.type === "document" ? "Accessed Document: " : "Attempted Quiz: "}
                          </span>
                          <span className="text-zinc-500 font-normal md:hidden">
                            {activity.type === "document" ? "Doc: " : "Quiz: "}
                          </span>
                          {activity.description}
                        </p>
                        <p className="text-[10px] md:text-[11px] font-bold text-zinc-600 uppercase tracking-[0.15em] mt-1 group-hover:text-zinc-500 transition-colors">
                          {new Date(activity.timestamp).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* shrink-0 protects the button from getting squished by the text */}
                    {activity.link && (
                      <div className="shrink-0 flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-full md:rounded-xl bg-white/5 text-zinc-400 md:text-white text-[11px] font-bold uppercase tracking-wider group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300">
                        <span className="hidden md:block">View</span>
                        <ChevronRight className="w-4 h-4 md:hidden" strokeWidth={3} />
                      </div>
                    )}
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-16 px-4 border border-white/5 rounded-3xl bg-black/20">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner">
                <Clock className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-base md:text-lg text-white font-medium">No recent activity yet.</p>
              <p className="text-zinc-500 text-[10px] md:text-xs mt-2 uppercase tracking-[0.2em] font-bold">
                Start learning to see progress here
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;