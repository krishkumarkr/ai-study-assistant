import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/prgressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Link as LinkIcon,
} from "lucide-react";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        console.log("Data___getDashboardData", data);

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
    return <Spinner />;
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="p-10 rounded-4xl bg-white/2 border border-white/10 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-white/5">
            <TrendingUp className="text-zinc-600 w-8 h-8" />
          </div>
          <p className="text-white font-medium">No dashboard data available.</p>
        </div>
      </div>
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
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="">
        <h1 className="className=text-3xl font-bold text-2xl text-white tracking-normal mb-2">
          Dashboard
        </h1>
        <p className="text-zinc-500 text-sm">
          Track your learning progress and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white/2 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/4 transition-all duration-300 shadow-2xl shadow-black/50"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                {stat.label}
              </span>
              <div
                className={`p-3 rounded-2xl bg-linear-to-br ${stat.gradient} ${stat.shadowColor} shadow-lg text-white`}
              >
                <stat.icon size={20} strokeWidth={2} />
              </div>
            </div>
            <div className="text-4xl font-bold text-white tracking-tight">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white/2 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-emerald-400">
            <Clock size={20} strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Recent Activity
          </h3>
        </div>

        {dashboardData.recentActivity &&
        (dashboardData.recentActivity.documents.length > 0 ||
          dashboardData.recentActivity.quizzes.length > 0) ? (
          <div className="space-y-4">
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
                timestamp: quiz.lastAttempted,
                link: `/quizzes/${quiz._id}`,
                type: "quiz",
              })),
            ]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white/1 border border-white/5 hover:bg-white/3 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                        activity.type === "document"
                          ? "bg-linear-to-r from-blue-400 to-cyan-500 shadow-blue-500/20"
                          : "bg-linear-to-r from-emerald-400 to-teal-500 shadow-emerald-500/20"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-300">
                        <span className="text-zinc-500 font-normal">
                          {activity.type === "document"
                            ? "Accessed Document: "
                            : "Attempted Quiz: "}
                        </span>
                        <span>{activity.description}</span>
                      </p>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                      {new Date(activity.timestamp).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  {activity.link && (
                    <Link
                      to={activity.link}
                      className="px-4 py-2 rounded-xl bg-white/5 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all"
                    >
                      View
                    </Link>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Clock className="text-zinc-700" />
            </div>
            <p className="text-white font-medium">No recent activity yet.</p>
            <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-[0.2em] font-bold">
              Start learning to see progress here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
