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
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";
import BackgroundGlow from "../../components/common/BackgroundGlow";

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
    if (loading) return <Spinner />;
    
    if (!document || !document.data || !document.data.filePath) {
      return (
        <div className="flex flex-col items-center justify-center p-8 md:p-20 mx-2 sm:mx-0 bg-white/2 border border-white/5 rounded-2xl md:rounded-4xl text-center shadow-inner">
          <FileWarning className="text-zinc-600 mb-3 md:mb-4 w-10 h-10 md:w-12 md:h-12" />
          <p className="text-zinc-400 font-medium text-sm md:text-base px-4">
            PDF content is not available
          </p>
        </div>
      );
    }

    const pdfUrl = getPdfUrl();

    return (
      // Added min-w-0 to prevent the content block from causing flex blowout
      <div className="flex flex-col space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full min-w-0">
        
        {/* PDF Viewer Header */}
        <div className="relative overflow-hidden w-full min-w-0 flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-5 bg-linear-to-b from-white/3 to-transparent backdrop-blur-xl border border-white/5 rounded-xl md:rounded-2xl shadow-inner">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Added min-w-0 and truncate to strictly contain the viewer title */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10 truncate min-w-0">
             <div className="shrink-0 p-1.5 sm:p-2 md:p-2.5 rounded-lg md:rounded-xl bg-zinc-950 border border-white/5 text-zinc-500 shadow-inner">
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             </div>
             <span className="text-[10px] md:text-xs font-black text-white/70 uppercase tracking-[0.2em] truncate min-w-0">
              Document Viewer
            </span>
          </div>
          
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0 flex items-center gap-1.5 md:gap-2 text-[9px] sm:text-[10px] md:text-xs font-black text-black transition-all duration-300 uppercase tracking-widest bg-linear-to-br from-emerald-400 to-emerald-600 hover:to-emerald-300 px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-[1.03] active:scale-100"
          >
            <ExternalLink size={14} className="transition-transform group-hover:scale-110 w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Full Screen</span>
            <span className="sm:hidden">Expand</span>
          </a>
        </div>

        {/* PDF Viewer Container */}
        <div className="relative w-full min-w-0 h-[70vh] md:h-[75vh] lg:h-[80vh] bg-zinc-950 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col items-center justify-center">
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-zinc-900/50">
            <FileWarning className="w-10 h-10 md:w-12 md:h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-300 text-sm font-bold mb-2">
              Mobile Viewer Restricted
            </p>
            <p className="text-zinc-500 text-[11px] md:text-xs mb-6 max-w-xs leading-relaxed">
              Some mobile browsers block inline PDFs. Click below to view your document directly.
            </p>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950 rounded-lg md:rounded-xl font-black text-xs md:text-sm shadow-lg shadow-emerald-500/30">
              Open PDF
            </a>
          </div>

          <object
            data={pdfUrl}
            type="application/pdf"
            className="absolute inset-0 w-full h-full z-10 bg-zinc-950"
          >
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0 bg-white"
              title="PDF Viewer"
            />
          </object>
        </div>
      </div>
    );
  };

  const tabs = [
    { name: "Content", label: "Content", content: renderContent() },
    { name: "Chat", label: "Chat", content: <ChatInterface /> },
    { name: "AI Actions", label: "AI Actions", content: <AIActions /> },
    { name: "Flashcards", label: "Flashcards", content: <FlashcardManager documentId={id} /> },
    { name: "Quizzes", label: "Quizzes", content: <QuizManager documentId={id} /> },
  ];

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

  if (!document) {
    return (
      <>
        <BackgroundGlow />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-full max-w-md p-8 md:p-12 rounded-3xl bg-white/2 border border-white/10 backdrop-blur-xl shadow-2xl">
            <p className="text-lg md:text-xl font-bold text-white mb-2">Document not found.</p>
            <p className="text-zinc-500 text-sm mb-6">It may have been deleted or is currently unavailable.</p>
            <Link to="/documents" className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
              Return to list
            </Link>
          </div>
        </div>
      </>
    );
  }

 return (
    <>
      <BackgroundGlow />
      
      {/* 1. Added 'flex flex-col min-h-[calc(100vh-2rem)]' to make it a full-height column.
        2. Swapped 'space-y-X' for 'gap-X' to control the spacing safely in flex mode.
      */}
      <div className="relative z-10 w-full min-w-0 max-w-full overflow-x-hidden mx-auto flex flex-col min-h-[calc(100vh-2rem)] gap-4 md:gap-6 px-2 sm:px-4 md:px-6 pt-2 pb-6">
        
        {/* Added shrink-0 so it doesn't get crushed */}
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 shrink-0">
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 text-[11px] md:text-sm font-bold text-zinc-500 hover:text-emerald-400 transition-all uppercase tracking-widest group"
          >
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white/5 border border-white/10 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all">
              <ArrowLeft size={16} className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            Back to Documents
          </Link>
        </div>

        {/* Added shrink-0 so the header doesn't get crushed */}
        <div className="w-full min-w-0 [&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:md:text-4xl [&_h1]:break-all lg:[&_h1]:break-words [&_h1]:leading-tight pr-2 shrink-0">
          <PageHeader
            title={document.data.title}
            subtitle={`Last analyzed: ${new Date(document.data.updatedAt).toLocaleDateString()}`}
          />
        </div>

        {/* THE MASTER FIX: Added 'flex-1'. 
          This forces the dark box to stretch down and fill all remaining space on the screen!
        */}
        <div className="flex-1 bg-white/2 border border-white/5 rounded-2xl sm:rounded-3xl md:rounded-[40px] p-2 sm:p-4 md:p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden w-full min-w-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Added h-full and flex flex-col so the content inside can stretch if needed */}
          <div className="relative z-10 w-full h-full flex flex-col min-w-0">
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>

      </div>
    </>
  );
};

export default DocumentDetailPage;