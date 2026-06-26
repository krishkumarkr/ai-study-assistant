import React, { useState, useEffect } from "react";
import { Plus, Upload, Trash2, FileText, X } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import DocumentCard from "../../components/documents/DocumentCard";
import BackgroundGlow from "../../components/common/BackgroundGlow";

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const response = await documentService.getDocuments();
      const docsArray = Array.isArray(response)
        ? response
        : response.data || [];
      setDocuments(docsArray);
    } catch (error) {
      toast.error("Failed to fetch documents.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      await fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`'${selectedDoc.title}' deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Spinner />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in zoom-in duration-700 px-4 sm:px-0">
          <div className="w-full max-w-2xl p-8 md:p-12 rounded-[32px] md:rounded-[40px] bg-white/2 border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-5 md:mb-6 shadow-inner">
                <FileText className="text-zinc-500 w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 tracking-tight">
                No Documents Yet.
              </h3>
              <p className="text-zinc-400 max-w-sm mx-auto mb-6 md:mb-8 text-xs md:text-sm leading-relaxed px-4">
                Get started by uploading your first PDF document to begin learning
                with AI assistance.
              </p>
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                size="lg"
                className="w-full sm:w-auto mx-auto shadow-lg shadow-emerald-500/20"
              >
                <Plus size={20} strokeWidth={2.5} className="mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      // CHANGED THIS LINE: Removed sm:grid-cols-2 so it stays 1 column until lg screens
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
        {documents?.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <BackgroundGlow />
      <div className="relative z-10 space-y-6 md:space-y-8 min-h-screen w-full max-w-7xl mx-auto px-2 sm:px-0 pt-2">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 px-1">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-1 md:mb-2">
              My Documents
            </h1>
            <p className="text-zinc-400 text-sm md:text-base font-medium">
              Manage and organize your learning materials
            </p>
          </div>
          {documents.length > 0 && (
            <Button 
              onClick={() => setIsUploadModalOpen(true)} 
              className="w-full sm:w-auto px-6 py-3.5 sm:py-3 shadow-lg shadow-emerald-500/10"
            >
              <Plus className="mr-2" size={18} strokeWidth={2.5} />
              Upload Document
            </Button>
          )}
        </div>

        {renderContent()}

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setIsUploadModalOpen(false)}
            />
            <div className="relative bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-300">
              
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} strokeWidth={2.5} />
              </button>

              <div className="mb-6 md:mb-8 pr-8">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Upload New Document
                </h2>
                <p className="text-zinc-400 text-xs md:text-sm mt-1.5">
                  Add a PDF document to your library.
                </p>
              </div>

              <form onSubmit={handleUpload} className="space-y-5 md:space-y-6">

                <div>
                  <label className="block text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm md:text-base text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
                    placeholder="e.g., React Interview Prep"
                  />
                </div>

                <div>
                  <label className="block text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">
                    PDF File
                  </label>
                  <div className="relative group">
                    <input
                      id="file-upload"
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleFileChange}
                      accept=".pdf"
                    />
                    <div className="border-2 border-dashed border-white/10 rounded-3xl p-6 md:p-8 text-center group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 transition-all bg-black/20">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 group-hover:text-emerald-400 flex items-center justify-center mx-auto mb-3 md:mb-4 transition-colors shadow-inner">
                        <Upload size={24} strokeWidth={2} />
                      </div>
                      <p className="text-xs md:text-sm font-medium text-zinc-400 px-4">
                        {uploadFile ? (
                          <span className="text-emerald-400 font-bold truncate block">
                            {uploadFile.name}
                          </span>
                        ) : (
                          <>
                            <span className="text-white">Tap to upload</span>
                            <span className="hidden sm:inline"> or drag and drop</span>
                          </>
                        )}
                      </p>
                      <p className="text-[9px] md:text-[10px] font-bold text-zinc-600 uppercase tracking-[0.15em] mt-2">
                        PDF up to 100MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 md:gap-4 pt-2 md:pt-4">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={uploading}
                    className="flex-1 py-3.5 md:py-4 text-xs md:text-sm font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 py-3.5 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center active:scale-[0.98] disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                        Uploading...
                      </span>
                    ) : (
                      "Upload"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <div className="relative bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-300">

              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} strokeWidth={2.5} />
              </button>

              <div className="flex flex-col items-center text-center mb-5 md:mb-6 mt-2">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                  <Trash2 size={24} strokeWidth={2} className="md:w-7 md:h-7" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Confirm Deletion
                </h2>
              </div>

              <p className="text-zinc-400 text-center text-xs md:text-sm leading-relaxed mb-6 md:mb-8 px-2">
                Are you sure you want to delete the document:{" "}
                <span className="text-white font-bold block mt-1.5 mb-1.5 truncate">
                  "{selectedDoc?.title}"
                </span>
                This action cannot be undone and will remove all associated AI data.
              </p>

              <div className="flex gap-3 text-xs md:text-sm">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleting}
                  className="flex-1 py-3.5 md:py-4 font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 py-3.5 md:py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                >
                  {deleting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentListPage;