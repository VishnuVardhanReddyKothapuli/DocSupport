import React, { useState } from 'react';
import { Sparkles, Sun, Moon, ArrowRight, Menu, X, BookOpen, User } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface NavbarProps {
  currentRoute: 'landing' | 'login' | 'terms' | 'app';
  onNavigate: (route: 'landing' | 'login' | 'terms' | 'app') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentRoute !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FBFBFD]/85 dark:bg-[#161617]/85 backdrop-blur-md border-b border-[#D2D2D7]/50 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-6 h-6 rounded-md bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] flex items-center justify-center text-xs font-semibold">
            D
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            DocSupport
          </span>
          <span className="text-[10px] font-mono tracking-normal text-[#86868B] dark:text-[#A1A1A6] hidden sm:inline-block">
            RAG
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-[12px] font-normal text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80">
          <button
            onClick={() => handleSectionClick('features')}
            className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
          >
            Capabilities
          </button>
          <button
            onClick={() => handleSectionClick('gitloader')}
            className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
          >
            GitLoader
          </button>
          <button
            onClick={() => handleSectionClick('guardrails')}
            className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
          >
            Dual Guardrails
          </button>
          <button
            onClick={() => handleSectionClick('architecture')}
            className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
          >
            Architecture
          </button>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors flex items-center gap-1"
          >
            <span>API Docs</span>
          </a>
          <button
            onClick={() => onNavigate('terms')}
            className={`hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors ${
              currentRoute === 'terms' ? 'text-[#0071E3] dark:text-[#2997FF] font-medium' : ''
            }`}
          >
            Terms
          </button>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full text-[#6E6E73] dark:text-[#A1A1A6] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Toggle color theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Login Link */}
          {currentRoute !== 'login' && (
            <button
              onClick={() => onNavigate('login')}
              className="text-[12px] font-normal text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF] px-2.5 py-1 transition-colors hidden sm:inline-block"
            >
              Sign In
            </button>
          )}

          {/* Primary Action Button (Apple pill shape) */}
          <button
            onClick={() => onNavigate('app')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] text-[12px] font-medium hover:opacity-90 transition-opacity"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#D2D2D7]/60 dark:border-white/10 bg-[#FBFBFD] dark:bg-[#161617] px-6 py-4 space-y-3 text-sm animate-in fade-in duration-150">
          <button
            onClick={() => handleSectionClick('features')}
            className="block w-full text-left py-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]"
          >
            Capabilities
          </button>
          <button
            onClick={() => handleSectionClick('gitloader')}
            className="block w-full text-left py-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]"
          >
            GitLoader
          </button>
          <button
            onClick={() => handleSectionClick('guardrails')}
            className="block w-full text-left py-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]"
          >
            Dual Guardrails
          </button>
          <button
            onClick={() => handleSectionClick('architecture')}
            className="block w-full text-left py-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]"
          >
            Architecture
          </button>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-left py-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]"
          >
            API Docs
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('terms');
            }}
            className="block w-full text-left py-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]"
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('login');
            }}
            className="block w-full text-left py-1.5 text-[#0071E3] font-medium"
          >
            Sign In
          </button>
        </div>
      )}
    </nav>
  );
};
