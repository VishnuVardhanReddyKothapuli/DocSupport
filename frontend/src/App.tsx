import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { QAWorkspace } from './components/QAWorkspace';
import { UploadModal } from './components/UploadModal';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { TermsPage } from './components/TermsPage';
import { fetchDocuments, deleteDocument, DocumentItem } from './api/sourceIngestion';

type Route = 'landing' | 'login' | 'terms' | 'app';

function getInitialRoute(): Route {
  if (typeof window === 'undefined') return 'landing';
  const hash = window.location.hash.toLowerCase();
  if (hash === '#/login' || hash === '#login') return 'login';
  if (hash === '#/terms' || hash === '#terms') return 'terms';
  if (hash === '#/app' || hash === '#app') return 'app';
  return 'landing';
}

export function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>(getInitialRoute);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'qa'>('dashboard');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync route with window.location.hash
  const navigateTo = (route: Route) => {
    setCurrentRoute(route);
    if (route === 'landing') {
      window.location.hash = '#/';
    } else {
      window.location.hash = `#/${route}`;
    }
    // Scroll window to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const route = getInitialRoute();
      setCurrentRoute(route);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load documents
  const loadDocs = async () => {
    try {
      setLoading(true);
      const docs = await fetchDocuments();
      setDocuments(docs);

      // Keep selected document synced
      if (selectedDoc) {
        const updated = docs.find((d) => d.id === selectedDoc.id);
        if (updated) setSelectedDoc(updated);
      } else if (docs.length > 0) {
        const completed = docs.find((d) => d.status === 'COMPLETED');
        if (completed) setSelectedDoc(completed);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  // Poll while any document is in PENDING or PROCESSING state
  useEffect(() => {
    const hasActiveJobs = documents.some(
      (d) => d.status === 'PENDING' || d.status === 'PROCESSING'
    );
    if (!hasActiveJobs) return;

    const interval = setInterval(() => {
      fetchDocuments().then((updated) => {
        setDocuments(updated);
      }).catch(console.error);
    }, 3000);

    return () => clearInterval(interval);
  }, [documents]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this knowledge source? All vector chunks will be permanently removed.')) {
      return;
    }
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document');
    }
  };

  const handleSelectForQA = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setActiveTab('qa');
  };

  // Route Views
  if (currentRoute === 'landing') {
    return <LandingPage onNavigate={navigateTo} />;
  }

  if (currentRoute === 'login') {
    return (
      <LoginPage
        onNavigate={navigateTo}
        onLoginSuccess={(_userId) => {
          navigateTo('app');
        }}
      />
    );
  }

  if (currentRoute === 'terms') {
    return <TermsPage onNavigate={navigateTo} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentCount={documents.length}
        onNavigate={navigateTo}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#000000]">
        {activeTab === 'dashboard' ? (
          <Dashboard
            documents={documents}
            loading={loading}
            onRefresh={loadDocs}
            onOpenUpload={() => setIsUploadOpen(true)}
            onDeleteDocument={handleDelete}
            onSelectForQA={handleSelectForQA}
          />
        ) : (
          <QAWorkspace
            documents={documents}
            selectedDoc={selectedDoc}
            onSelectDoc={(d) => setSelectedDoc(d)}
            onSwitchToDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Upload Source Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(newDoc) => {
          setDocuments((prev) => [newDoc, ...prev]);
          if (newDoc.status === 'COMPLETED') {
            setSelectedDoc(newDoc);
          }
        }}
      />
    </div>
  );
}

export default App;
