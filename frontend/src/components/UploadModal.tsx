import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  FileText, 
  Globe, 
  Video, 
  AlignLeft, 
  UploadCloud, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { 
  uploadPdfDocument, 
  ingestTextDocument, 
  ingestWebDocument, 
  ingestYouTubeDocument, 
  ingestGitRepository,
  DocumentItem
} from '../api/sourceIngestion';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: DocumentItem) => void;
}

type TabType = 'GIT' | 'PDF' | 'WEBSITE' | 'YOUTUBE' | 'TEXT';

const DEFAULT_CODE_EXTS = ['.py', '.ts', '.tsx', '.js', '.jsx', '.md', '.go', '.rs', '.java', '.cpp', '.sql', '.yaml', '.json'];

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<TabType>('GIT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Git state
  const [gitUrl, setGitUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('');
  const [gitToken, setGitToken] = useState('');
  const [gitName, setGitName] = useState('');
  const [selectedExts, setSelectedExts] = useState<string[]>(DEFAULT_CODE_EXTS);

  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Web state
  const [webUrl, setWebUrl] = useState('');
  const [webTitle, setWebTitle] = useState('');

  // YouTube state
  const [ytUrl, setYtUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');

  // Text state
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  if (!isOpen) return null;

  const toggleExtension = (ext: string) => {
    setSelectedExts(prev => 
      prev.includes(ext) ? prev.filter(e => e !== ext) : [...prev, ext]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let createdDoc: DocumentItem;

      if (activeTab === 'GIT') {
        if (!gitUrl.trim()) throw new Error('Repository URL is required');
        createdDoc = await ingestGitRepository(
          gitUrl.trim(),
          gitBranch.trim() || undefined,
          selectedExts,
          gitToken.trim() || undefined,
          gitName.trim() || undefined
        );
      } else if (activeTab === 'PDF') {
        if (!pdfFile) throw new Error('Please select a PDF file to upload');
        createdDoc = await uploadPdfDocument(pdfFile);
      } else if (activeTab === 'WEBSITE') {
        if (!webUrl.trim()) throw new Error('Web URL is required');
        createdDoc = await ingestWebDocument(webUrl.trim(), webTitle.trim() || undefined);
      } else if (activeTab === 'YOUTUBE') {
        if (!ytUrl.trim()) throw new Error('YouTube URL is required');
        createdDoc = await ingestYouTubeDocument(ytUrl.trim(), ytTitle.trim() || undefined);
      } else {
        if (!textTitle.trim()) throw new Error('Title is required');
        if (!textContent.trim()) throw new Error('Content is required');
        createdDoc = await ingestTextDocument(textTitle.trim(), textContent.trim());
      }

      onSuccess(createdDoc);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Ingestion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-cyber-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Add Knowledge Source</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Index files, web links, media, or full codebases with GitLoader</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 dark:border-cyber-border bg-slate-50 dark:bg-slate-900/50 px-6 pt-2 overflow-x-auto no-scrollbar gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('GIT')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === 'GIT'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-cyber-card'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <GitBranch className="w-4 h-4 text-emerald-500" />
            GitLoader (Code)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PDF')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === 'PDF'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-cyber-card'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            PDF Document
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WEBSITE')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === 'WEBSITE'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-cyber-card'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-500" />
            Web Page
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('YOUTUBE')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === 'YOUTUBE'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-cyber-card'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Video className="w-4 h-4 text-rose-500" />
            YouTube / Video
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TEXT')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === 'TEXT'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-cyber-card'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <AlignLeft className="w-4 h-4 text-amber-500" />
            Raw Text
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* GIT TAB */}
          {activeTab === 'GIT' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Remote Git Repository URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/fastapi/fastapi"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports GitHub, GitLab, and public Git repositories via shallow clone (<code className="text-indigo-400">depth=1</code>).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Branch or Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="main or v1.0.0"
                    value={gitBranch}
                    onChange={(e) => setGitBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Repository Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FastAPI Core Engine"
                    value={gitName}
                    onChange={(e) => setGitName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Included File Extensions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_CODE_EXTS.map((ext) => {
                    const isSelected = selectedExts.includes(ext);
                    return (
                      <button
                        type="button"
                        key={ext}
                        onClick={() => toggleExtension(ext)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'border-slate-200 dark:border-cyber-border text-slate-400 opacity-60'
                        }`}
                      >
                        {ext}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Private Access Token (Optional)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={gitToken}
                    onChange={(e) => setGitToken(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          )}

          {/* PDF TAB */}
          {activeTab === 'PDF' && (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-slate-300 dark:border-cyber-border hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/40"
                onClick={() => document.getElementById('pdf-file-input')?.click()}
              >
                <FileText className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {pdfFile ? pdfFile.name : 'Click to select or drag and drop a PDF file'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : 'Up to 50 MB with page-level chunk mapping'}
                </p>
                <input
                  id="pdf-file-input"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files && setPdfFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* WEBSITE TAB */}
          {activeTab === 'WEBSITE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Web Page URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://docs.python.org/3/library/asyncio.html"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Custom Page Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Python Asyncio Documentation"
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* YOUTUBE TAB */}
          {activeTab === 'YOUTUBE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  YouTube Video URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Extracts automated and manual closed-captions with timestamps mapped onto vector chunks.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Video Label / Topic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Deep Learning Lecture 1"
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* RAW TEXT TAB */}
          {activeTab === 'TEXT' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Architecture Decision Record: pgvector Migration"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Content (Raw Text or Markdown) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {textContent.length.toLocaleString()} characters
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder="Paste documentation, logs, or markdown notes here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-cyber-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-glow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Indexing Source...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ingest & Vectorize</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
