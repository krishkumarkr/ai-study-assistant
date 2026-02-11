import React, { useState, useEffect } from "react";
import { Plus, Upload, Trash2, FileText, X } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import DocumentCard from "../../components/documents/DocumentCard";

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
      setLoading(false);
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
        <div>
          <Spinner />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in zoom-in duration-700">
          <div className="p-12 rounded-[40px] bg-white/2 border border-white/5 backdrop-blur-3xl shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-6">
              <FileText className="text-zinc-500 w-10 h-10" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
              No Documents Yet.
            </h3>
            <p className="text-zinc-500 max-w-sm mb-8 text-sm leading-relaxed">
              Get started by uploading your first PDF document to begin learning
              with AI assistance.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 mx-auto"
            >
              <Plus size={20} strokeWidth={2.5} />
              Upload Document
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
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
    <div className="space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            My Documents
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage and organize your learning materials
          </p>
        </div>
        {documents.length > 0 && (
          <Button onClick={() => setIsUploadModalOpen(true)} className="px-6">
            <Plus className="mr-2" size={18} strokeWidth={2.5} />
            Upload Document
          </Button>
        )}
      </div>

      {renderContent()}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsUploadModalOpen(false)}
          />
          <div className="relative bg-zinc-950 border border-white/10 rounded-[40px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} strokeWidth={2} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Upload New Document
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Add a PDF document to your library.
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                  placeholder="e.g., React Interview Prep"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">
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
                  <div className="border-2 border-dashed border-white/5 rounded-3xl p-8 text-center group-hover:border-emerald-500/30 group-hover:bg-emerald-500/2 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 group-hover:text-emerald-400 flex items-center justify-center mx-auto mb-4 transition-colors">
                      <Upload size={24} strokeWidth={2} />
                    </div>
                    <p className="text-sm font-medium text-zinc-400">
                      {uploadFile ? (
                        <span className="text-emerald-400 font-bold">
                          {uploadFile.name}
                        </span>
                      ) : (
                        <>
                          <span className="text-white">Click to upload</span>
                          or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">
                      PDF up to 100MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={uploading}
                  className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center"
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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-zinc-950 border border-white/10 rounded-[40px] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300">

            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} strokeWidth={2} />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                <Trash2 size={28} strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Confirm Deletion
              </h2>
            </div>

            <p className="text-zinc-400 text-center text-sm leading-relaxed mb-8 px-2">
              Are you sure you want to delete the document:{" "}
              <span className="text-white font-bold block mt-1">
                "{selectedDoc?.title}"
              </span>
              This action cannot be undone and will remove all associated AI
              data.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {deleting ? (
                  <div className="flex items-center justify-center gap-2">
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
  );
};

export default DocumentListPage;
