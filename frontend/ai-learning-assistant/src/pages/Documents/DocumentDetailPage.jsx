import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import Tabs from "../../components/common/Tabs";
import PageHeader from "../../components/common/PageHeader";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink, FileWarning } from "lucide-react";
import ChatInterface from "../../components/Chat/ChatInterface";
import AIActions from "../../components/ai/AiActions";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error("Failed to fetch document details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  // Helper function to get the full PDF URL
  const getPdfUrl = () => {
    if (!document?.data?.filePath) return null;

    const filePath = document.data.filePath;

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
    return `${baseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (!document || !document.data || !document.data.filePath) {
      return (
        <div className="flex flex-col items-center justify-center p-20 bg-white/2 border border-white/5 rounded-4xl">
          <FileWarning className="text-zinc-600 mb-4" size={48} />
          <p className="text-zinc-400 font-medium">
            PDF content is not available
          </p>
        </div>
      );
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/5 rounded-2xl">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Document Viewer
          </span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-[11px] font-bold text-emerald-400 hover:text-white transition-all duration-300 uppercase tracking-widest bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10 hover:border-emerald-500/40">
            <ExternalLink
              size={14}
              className="transition-transform"
            />
            Full Screen
          </a>
        </div>
        <div className="relative w-full aspect-4/5 md:aspect-video lg:aspect-16/10 bg-zinc-900 rounded-4xl overflow-hidden border border-white/10 shadow-2xl">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Viewer"
            frameBorder="0"
            style={{
              colorScheme: "light",
            }}
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />;
  };

  const renderAIActions = () => {
    return <AIActions />;
  };

  const renderFlashcardsTab = () => {
    return "renderFLashcardsTab";
  };

  const renderQuizzesTab = () => {
    return "renderQuizzesTab";
  };

  const tabs = [
    { name: "Content", label: "Content", content: renderContent() },
    { name: "Chat", label: "Chat", content: renderChat() },
    { name: "AI Actions", label: "AI Actions", content: renderAIActions() },
    { name: "Flashcards", label: "Flashcards", content: renderFlashcardsTab() },
    { name: "Quizzes", label: "Quizzes", content: renderQuizzesTab() },
  ];

  if (loading) {
    return <Spinner />;
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <p className="text-xl font-bold opacity-50">Document not found.</p>
        <Link to="/documents" className="mt-4 text-emerald-400 hover:underline">
          Return to list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-emerald-400 transition-all uppercase tracking-widest group"
        >
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-emerald-500/30 transition-all">
            <ArrowLeft size={16} />
          </div>
          Back to Documents
        </Link>
      </div>
      <PageHeader
        title={document.data.title}
        subtitle={`Last analyzed: ${new Date(document.data.updatedAt).toLocaleDateString()}`}
      />
      <div className="bg-white/1 border border-white/5 rounded-[40px] p-2 md:p-6 backdrop-blur-3xl shadow-2xl">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default DocumentDetailPage;
