import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb, Loader2 } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";
import Modal from "../common/Modal";

const AIActions = () => {
    const { id: documentId } = useParams();
    const [loadingAction, setLoadingAction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [concept, setConcept] = useState("");

    const handleGenerateSummary = async () => {
        setLoadingAction("summary");
        try {
            const response = await aiService.generateSummary(documentId);
            setModalTitle("Generated Summary");
            setModalContent(response.data.summary);
            setIsModalOpen(true);
        } catch (error) {
            // This perfectly catches the 403 quota or 429 rate limit messages!
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to generate summary.";
            toast.error(errorMsg);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleExplainConcept = async (e) => {
        if (e) e.preventDefault();
        if (!concept.trim()) {
            toast.error("Please enter a concept to explain.");
            return;
        }
        setLoadingAction("explain");
        try {
            const response = await aiService.explainConcept(documentId, concept);
            setModalTitle(`Explanation: ${concept}`);
            setModalContent(response.data.explanation);
            setIsModalOpen(true);
            setConcept("");
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to explain concept.";
            toast.error(errorMsg);
        } finally {
            setLoadingAction(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => { setModalContent(""); setModalTitle(""); }, 300);
    };

    return (
        <>
            <div className="space-y-6 animate-in fade-in duration-500 w-full">
                
                {/* Header */}
                <div className="flex items-center gap-3 px-1 w-full">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner shrink-0">
                        <Sparkles className="text-emerald-400" size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight">AI Assistant</h3>
                        <p className="text-xs text-zinc-400">Powered by advanced AI</p>
                    </div>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 gap-4 md:gap-6 w-full">
                    
                    {/* Card: Summary */}
                    <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 md:p-6 hover:bg-white/10 hover:border-white/10 transition-all duration-300 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-5 group">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 md:mb-3">
                                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                                    <BookOpen size={18} />
                                </div>
                                <h4 className="font-bold text-white text-sm md:text-base">Generate Summary</h4>
                            </div>
                            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-2xl">
                                Get a concise, high-level summary of the entire document. Perfect for a quick overview before diving deep.
                            </p>
                        </div>
                        <button
                            onClick={handleGenerateSummary}
                            disabled={loadingAction !== null}
                            className="w-full lg:w-auto shrink-0 lg:px-8 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-400 text-black rounded-xl font-bold text-xs md:text-sm transition-all disabled:opacity-50 active:scale-[0.98] mt-2 lg:mt-0 flex items-center justify-center gap-2 shadow-lg"
                        >
                            {loadingAction === "summary" ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Summarizing...</span>
                                </>
                            ) : (
                                "Summarize Document"
                            )}
                        </button>
                    </div>

                    {/* Card: Explain Concept */}
                    <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 md:p-6 hover:bg-white/10 hover:border-white/10 transition-all duration-300 shadow-xl flex flex-col group">
                        <form onSubmit={handleExplainConcept} className="flex flex-col h-full gap-4 md:gap-5">
                            <div>
                                <div className="flex items-center gap-3 mb-2 md:mb-3">
                                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                                        <Lightbulb size={18} />
                                    </div>
                                    <h4 className="font-bold text-white text-sm md:text-base">Explain Concept</h4>
                                </div>
                                <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-2xl">
                                    Enter a specific topic to get a deep-dive explanation based on the context of this document.
                                </p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full">
                                <input
                                    type="text"
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    placeholder="Enter concept (e.g., Database Indexing)..."
                                    className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs md:text-sm focus:outline-none focus:border-emerald-500/50 disabled:opacity-40 transition-all"
                                    disabled={loadingAction !== null}
                                />
                                <button
                                    type="submit"
                                    disabled={loadingAction !== null || !concept.trim()}
                                    className="w-full md:w-auto shrink-0 md:px-8 py-3 bg-white/10 hover:bg-white text-white hover:text-black border border-white/5 rounded-xl font-bold text-xs md:text-sm transition-all disabled:opacity-30 disabled:bg-white/5 disabled:text-white active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {loadingAction === "explain" ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Analyzing...</span>
                                        </>
                                    ) : (
                                        "Explain Concept"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Results Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
                <div className="text-sm text-zinc-300 leading-relaxed pr-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <MarkdownRenderer content={modalContent} />
                </div>
            </Modal>
        </>
    );
}

export default AIActions;