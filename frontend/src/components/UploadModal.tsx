import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  FileText, 
  Globe, 
  Video, 
  AlignLeft, 
  Lock, 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#FBFBFD] dark:bg-[#161617] border border-[#D2D2D7]/60 dark:border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[#1D1D1F] dark:text-[#F5F5F7]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#D2D2D7]/50 dark:border-white/10">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#0071E3] font-semibold mb-1">
              Source Ingestion
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Add Knowledge Source
            </h2>
            <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] mt-0.5">
              Index codebases, documents, web pages, or transcripts into pgvector 768d.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Apple Segmented Tab Selector */}
        <div className="px-6 pt-4 pb-2 bg-[#F5F5F7] dark:bg-[#1D1D1F]/50 border-b border-[#D2D2D7]/40 dark:border-white/10">
          <div className="flex p-1 rounded-xl bg-white dark:bg-[#161617] border border-[#D2D2D7]/50 dark:border-white/10 overflow-x-auto no-scrollbar gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('GIT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'GIT'
                  ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] shadow-sm font-semibold'
                  : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitLoader</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PDF')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'PDF'
                  ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] shadow-sm font-semibold'
                  : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Document</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('WEBSITE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'WEBSITE'
                  ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] shadow-sm font-semibold'
                  : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web Page</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('YOUTUBE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'YOUTUBE'
                  ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] shadow-sm font-semibold'
                  : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Transcript</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TEXT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'TEXT'
                  ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] shadow-sm font-semibold'
                  : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Raw Text</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* GIT TAB */}
          {activeTab === 'GIT' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                  Remote Git Repository URL <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/fastapi/fastapi"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#000000] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
                />
                <p className="text-[11px] text-[#86868B] mt-1 font-mono">
                  Shallow clone (<code className="text-[#0071E3]">depth=1</code>) with automated post-indexing disk cleanup.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                    Branch or Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="main or v1.0.0"
                    value={gitBranch}
                    onChange={(e) => setGitBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#000000] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                    Custom Repository Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FastAPI Core Engine"
                    value={gitName}
                    onChange={(e) => setGitName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#000000] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
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
                        className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all ${
                          isSelected
                            ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] border-transparent font-medium shadow-sm'
                            : 'border-[#D2D2D7]/60 dark:border-white/15 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                        }`}
                      >
                        {ext}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                  Personal Access Token (Optional, for private repositories)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={gitToken}
                    onChange={(e) => setGitToken(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#000000] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-3" />
                </div>
              </div>
            </div>
          )}

          {/* PDF TAB */}
          {activeTab === 'PDF' && (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-[#D2D2D7] dark:border-white/20 hover:border-[#0071E3] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white dark:bg-[#000000]"
                onClick={() => document.getElementById('pdf-file-input')?.click()}
              >
                <FileText className="w-10 h-10 text-[#0071E3] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {pdfFile ? pdfFile.name : 'Select or drag a PDF document'}
                </p>
                <p className="text-xs text-[#86868B] mt-1 font-mono">
                  {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : 'Page-mapped chunk extraction with verbatim citation tracking'}
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
                <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                  Web Page URL <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://docs.python.org/3/library/asyncio.html"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#000000] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                  Custom Page Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Python Asyncio Documentation"
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#000000] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
                />
              </div>
            </div>
          )}

          {/* YOUTUBE TAB */}
          {activeTab === 'YOUTUBE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                  YouTube Video URL <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#000000] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
                />
                <p className="text-[11px] text-[#86868B] mt-1 font-mono">
                  Extracts automated transcripts with video timestamp chunk alignment.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                  Video Topic / Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Deep Learning Lecture 1"
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#000000] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
                />
              </div>
            </div>
          )}

          {/* RAW TEXT TAB */}
          {activeTab === 'TEXT' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                  Document Title <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Architecture Decision Record: pgvector Migration"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#000000] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Content (Raw Text or Markdown) <span className="text-[#FF3B30]">*</span>
                  </label>
                  <span className="text-[10px] text-[#86868B] font-mono">
                    {textContent.length.toLocaleString()} characters
                  </span>
                </div>
                <textarea
                  rows={7}
                  placeholder="Paste documentation, logs, or markdown notes here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#000000] text-xs font-mono focus:outline-none focus:border-[#0071E3] transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#D2D2D7]/50 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white dark:text-[#1D1D1F] bg-[#1D1D1F] dark:bg-[#F5F5F7] rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Vectorizing Chunks...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ingest &amp; Index</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
