import React, { useEffect } from 'react';
import { ArrowLeft, BookOpen, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface TermsPageProps {
  onNavigate: (route: 'landing' | 'login' | 'terms' | 'app') => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sections = [
    { id: 'section-1', title: '1. Acceptance of Terms & Service Scope' },
    { id: 'section-2', title: '2. Codebase Ingestion & Ephemeral GitLoader Policy' },
    { id: 'section-3', title: '3. Vector Storage, Embeddings & Data Ownership' },
    { id: 'section-4', title: '4. AI Output, Dual Guardrails & Grounding Guarantee' },
    { id: 'section-5', title: '5. Observability, Telemetry & Langfuse Tracing' },
    { id: 'section-6', title: '6. Acceptable Use & Prohibition of Adversarial Injection' },
    { id: 'section-7', title: '7. Intellectual Property & License Rights' },
    { id: 'section-8', title: '8. Service Availability & Modifications' },
    { id: 'section-9', title: '9. Limitation of Liability & Disclaimers' },
    { id: 'section-10', title: '10. Contact Information & Governing Law' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200 flex flex-col justify-between selection:bg-[#0071E3] selection:text-white">
      <Navbar currentRoute="terms" onNavigate={onNavigate} />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Overview</span>
        </button>

        {/* Page Header */}
        <div className="max-w-4xl pb-8 border-b border-[#D2D2D7]/50 dark:border-white/10 mb-12">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0071E3] mb-3">
            Legal &amp; Governance Documentation
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Terms and Conditions
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
            These Terms govern your use of the DocSupport Enterprise RAG platform, including GitLoader codebase ingestion, pgvector storage, LangGraph agent pipelines, and Groq inference services.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-[#86868B]">
            <span>Effective Date: October 16, 2026</span>
            <span>&bull;</span>
            <span>Version: 1.2.0 (Enterprise Release)</span>
          </div>
        </div>

        {/* 2-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Sticky Table of Contents */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 p-6 rounded-2xl border border-[#D2D2D7]/50 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#161617] shadow-subtle space-y-3">
              <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] uppercase tracking-wider mb-2">
                Table of Contents
              </div>
              <nav className="space-y-1.5 text-xs">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className="block w-full text-left py-1 text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors truncate"
                  >
                    {s.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Column: Editorial Document Body */}
          <article className="lg:col-span-8 space-y-14 text-sm md:text-base leading-relaxed text-[#1D1D1F]/90 dark:text-[#F5F5F7]/90 max-w-3xl">
            {/* Section 1 */}
            <section id="section-1" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                1. Acceptance of Terms &amp; Service Scope
              </h2>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                By accessing or connecting knowledge sources to the DocSupport platform (&ldquo;Service&rdquo;), you confirm that you have read, understood, and agreed to be bound by these Terms and Conditions. The Service enables authenticated users to clone and vectorize software repositories, extract text from technical documentation (including PDF, web pages, and transcripts), store 768-dimensional vector embeddings in PostgreSQL pgvector, and query those repositories via LangGraph dual-guardrail agent workflows.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                2. Codebase Ingestion &amp; Ephemeral GitLoader Policy
              </h2>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                When using the GitLoader service to index a remote Git repository:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                <li>
                  <strong>Authority to Ingest:</strong> You represent and warrant that you hold the legal right, authorization, or license to clone and index any repository URL and branch provided to the platform.
                </li>
                <li>
                  <strong>Ephemeral Storage:</strong> Repository cloning is strictly shallow (<code className="text-[#0071E3] font-mono">depth=1</code>) into isolated, temporary directories on the worker host. All raw source code files are permanently purged from host disks in a guaranteed <code className="font-mono">finally</code> execution block immediately following chunking.
                </li>
                <li>
                  <strong>Personal Access Tokens:</strong> Any personal access token provided for private repository ingestion is used strictly in-memory during the clone lifecycle and is never written to public vector tables or logs.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                3. Vector Storage, Embeddings &amp; Data Ownership
              </h2>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                All mathematical vector representations generated from your source materials are 768-dimensional normalized vectors (<code className="text-[#0071E3] font-mono">BAAI/bge-base-en-v1.5</code>) stored in your tenant-scoped PostgreSQL pgvector database. You retain 100% exclusive intellectual property and ownership over all original documents, source code, and resulting vector embeddings. DocSupport does not use your private code or uploaded documents to train public foundational AI models.
              </p>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                Deleting a knowledge source from the Dashboard executes an immediate cascading deletion (<code className="font-mono">ON DELETE CASCADE</code>), permanently erasing the parent document record and all associated vector chunks from PostgreSQL.
              </p>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                4. AI Output, Dual Guardrails &amp; Grounding Guarantee
              </h2>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                The platform utilizes Groq ultra-low-latency inference with strict system prompts and a multi-node LangGraph state machine designed to prevent hallucination. Under our Dual Guardrail protocol:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                <li>
                  The model is explicitly instructed to cite bracketed chunk identifiers for every factual claim.
                </li>
                <li>
                  If the retrieved vector chunks do not contain sufficient evidence to answer an inquiry, the system is programmed to explicitly abstain with the phrase: <em className="text-[#1D1D1F] dark:text-[#F5F5F7]">&ldquo;I am unable to answer this question based on the provided document.&rdquo;</em>
                </li>
                <li>
                  While the guardrail engine substantially minimizes hallucinations, AI outputs remain advisory. Developers and technical architects must verify critical architectural, legal, or deployment decisions against their original source code.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                5. Observability, Telemetry &amp; Langfuse Tracing
              </h2>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                DocSupport integrates with Langfuse for enterprise observability. Query metadata, retrieval latencies, guardrail evaluations, and token usage are recorded to monitor pipeline reliability and vector search efficiency. Telemetry data is retained in accordance with your organization&rsquo;s configured Langfuse project settings.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                6. Acceptable Use &amp; Prohibition of Adversarial Injection
              </h2>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                <li>
                  Submit malicious adversarial prompt injection strings intended to bypass security guardrails or extract system configuration.
                </li>
                <li>
                  Ingest or vectorize malware, exploits, or materials that violate applicable intellectual property or data privacy laws.
                </li>
                <li>
                  Attempt denial-of-service, automated scraping of unauthorized repositories, or circumvention of rate-limiting infrastructure.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                7. Intellectual Property &amp; License Rights
              </h2>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                DocSupport and its underlying software, interface components, and algorithms are proprietary to their respective creators and open-source contributors. No title or ownership in the platform software is transferred to you under these Terms.
              </p>
            </section>

            {/* Section 8 */}
            <section id="section-8" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                8. Service Availability &amp; Modifications
              </h2>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                We reserve the right to upgrade, modify, or temporarily suspend aspects of the Service to perform database migrations, model updates, or emergency maintenance. Significant revisions to these Terms will be documented with updated version stamps in this document.
              </p>
            </section>

            {/* Section 9 */}
            <section id="section-9" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                9. Limitation of Liability &amp; Disclaimers
              </h2>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS. TO THE MAXIMUM EXTENT PERMITTED BY LAW, DOCSUPPORT AND ITS CONTRIBUTORS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL DOCSUPPORT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM CODE DECISIONS OR SERVICE OUTAGES.
              </p>
            </section>

            {/* Section 10 */}
            <section id="section-10" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                10. Contact Information &amp; Governing Law
              </h2>
              <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
                For legal inquiries, repository compliance concerns, or enterprise licensing, contact your dedicated engineering administrator or review the Swagger API documentation on the local backend instance at <code className="text-[#0071E3] font-mono">http://localhost:8000/docs</code>.
              </p>
            </section>
          </article>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
