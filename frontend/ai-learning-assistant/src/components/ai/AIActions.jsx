import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb, X } from "lucide-react";
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
            const { summary } = await aiService.generateSummary(documentId);
            setModalTitle("Generated Summary");
            setModalContent(summary);
            setIsModalOpen(true);
        } catch (error) {
            toast.error("Failed to generate summary.");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleExplainConcept = async (e) => {
        e.preventDefault();
        if (!concept.trim()) {
            toast.error("Please enter a concept to explain.");
            return;
        }
        setLoadingAction("explain");
        try {
            const { explanation } = await aiService.explainConcept(
                documentId,
                concept
            );
            setModalTitle(`Explanation of "${concept}"`);
            setModalContent(explanation);
            setIsModalOpen(true);
            setConcept("");
        } catch (error) {
            toast.error("Failed to explain concept.");
        } finally {
            setLoadingAction(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setModalContent("");
            setModalTitle("");
        }, 300);
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex items-center gap-4 px-2">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                            <Sparkles className="text-emerald-400" size={24} strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">
                            AI Assistant
                        </h3>
                        <p className="text-sm text-zinc-400">Powered by advanced AI</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Generate Summary */}
                    <div className="bg-white/2 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/4 transition-all duration-300 shadow-xl shadow-black/20 flex flex-col group">
                        <div className="flex-1">
                            <div className="mb-6">
                                <div className="mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 group-hover:text-emerald-400 transition-colors text-zinc-400">
                                        <BookOpen className="" size={20} strokeWidth={2} />
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2 tracking-tight">Generate Summary</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Get a concise summary of the entire document.
                                </p>
                            </div>
                            <button
                                onClick={handleGenerateSummary}
                                disabled={loadingAction === "summary"}
                                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                            >
                                {loadingAction === "summary" ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                                        Loading...
                                    </span>
                                ) : (
                                    "Summarize"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Explain Concept */}
                    <div className="bg-white/2 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/4 transition-all duration-300 shadow-xl shadow-black/20 flex flex-col group">
                        <form onSubmit={handleExplainConcept} className="flex-1 flex flex-col">
                            <div className="flex-1 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-amber-500/10 group-hover:border-amber-500/20 group-hover:text-amber-400 transition-colors text-zinc-400">
                                        <Lightbulb className="" size={20} strokeWidth={2} />
                                    </div>
                                    <h4 className="text-lg font-bold text-white tracking-tight">Explain a Concept</h4>
                                </div>
                                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                    Enter a topic or concept from the document to get a detailed explanation.
                                </p>
                                <div className="space-y-4 mt-auto">
                                    <input
                                        type="text"
                                        value={concept}
                                        onChange={(e) => setConcept(e.target.value)}
                                        placeholder="Enter concept..."
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-zinc-600"
                                        disabled={loadingAction === "explain"}
                                    />
                                    <button
                                        type="submit"
                                        disabled={loadingAction === "explain" || !concept.trim()}
                                        className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        {loadingAction === "explain" ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                                                Loading...
                                            </span>
                                        ) : (
                                            "Explain"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Results Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={modalTitle}
            >
                <div className="w-full">
                    <MarkdownRenderer content={modalContent} />
                </div>
            </Modal>
        </>
    );
}

export default AIActions;