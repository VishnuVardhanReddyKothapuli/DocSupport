export interface SourceConfig {
  id: 'PDF' | 'WEBSITE' | 'YOUTUBE' | 'TEXT' | 'GIT';
  name: string;
  badge: string;
  description: string;
  iconName: string;
  tagColor: string;
}

export const SUPPORTED_SOURCES: Record<string, SourceConfig> = {
  GIT: {
    id: 'GIT',
    name: 'Git Repository',
    badge: 'GitLoader',
    description: 'Clone and index full software repositories with branch, commit, and file path citations.',
    iconName: 'GitBranch',
    tagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  PDF: {
    id: 'PDF',
    name: 'PDF Document',
    badge: 'PyPDF / Plumber',
    description: 'Extract and vectorize research papers, technical specs, manuals, and contracts with page citations.',
    iconName: 'FileText',
    tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  },
  WEBSITE: {
    id: 'WEBSITE',
    name: 'Web Page',
    badge: 'BeautifulSoup',
    description: 'Crawl and clean online documentation, articles, and websites into indexable knowledge.',
    iconName: 'Globe',
    tagColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
  },
  YOUTUBE: {
    id: 'YOUTUBE',
    name: 'YouTube & Media',
    badge: 'Transcripts / Whisper',
    description: 'Index timestamped video transcripts, lectures, and interviews for direct timeline Q&A.',
    iconName: 'Video',
    tagColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
  },
  TEXT: {
    id: 'TEXT',
    name: 'Raw Text / Markdown',
    badge: 'Direct Chunking',
    description: 'Paste direct notes, snippets, guidelines, or system documentation directly into the knowledge store.',
    iconName: 'AlignLeft',
    tagColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  }
};
