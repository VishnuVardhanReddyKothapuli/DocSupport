import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, ArrowRight, Menu, X, BookOpen, User } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { MotionButton } from './ui/button';

interface NavbarProps {
  currentRoute: 'landing' | 'login' | 'terms' | 'app';
  onNavigate: (route: 'landing' | 'login' | 'terms' | 'app') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

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

  const navLinks = [
    { id: 'features', label: 'Capabilities', action: () => handleSectionClick('features') },
    { id: 'gitloader', label: 'Codebase Ingestion', action: () => handleSectionClick('gitloader') },
    { id: 'guardrails', label: 'Dual Guardrails', action: () => handleSectionClick('guardrails') },
    { id: 'architecture', label: 'Architecture', action: () => handleSectionClick('architecture') },
    { id: 'terms', label: 'Terms', action: () => onNavigate('terms') },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FBFBFD]/85 dark:bg-[#161617]/85 backdrop-blur-md border-b border-[#D2D2D7]/50 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand Wordmark with Hover Scale */}
        <motion.button
          onClick={() => onNavigate('landing')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
        >
          <img
            src="/logo-icon.png"
            alt="DocSupport Logo"
            className="w-6 h-6 rounded-md object-contain shadow-xs border border-black/10 dark:border-white/15"
          />
          <span className="font-semibold text-sm tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            DocSupport
          </span>
          <span className="text-[10px] font-mono tracking-normal text-[#86868B] dark:text-[#A1A1A6] hidden sm:inline-block">
            RAG
          </span>
        </motion.button>

        {/* Desktop Navigation Links with animated hover highlight */}
        <div className="hidden md:flex items-center gap-1 text-[12px] font-normal text-[#1D1D1F]/80 dark:text-[#F5F5F7]/80">
          {navLinks.map((link) => {
            const isTermsActive = link.id === 'terms' && currentRoute === 'terms';
            return (
              <button
                key={link.id}
                onClick={link.action}
                onMouseEnter={() => setHoveredLink(link.id)}
                onMouseLeave={() => setHoveredLink(null)}
                className={`relative px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isTermsActive ? 'text-[#0071E3] dark:text-[#2997FF] font-medium' : 'hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                {hoveredLink === link.id && (
                  <motion.div
                    layoutId="navHoverPill"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-lg -z-10"
                  />
                )}
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle with 360-degree rotation */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ rotate: 180, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="p-1.5 rounded-full text-[#6E6E73] dark:text-[#A1A1A6] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Toggle color theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </motion.button>

          {/* Login Link */}
          {currentRoute !== 'login' && (
            <button
              onClick={() => onNavigate('login')}
              className="text-[12px] font-normal text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF] px-2.5 py-1 transition-colors hidden sm:inline-block cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Primary Action Button (Apple pill shape with MotionButton) */}
          <MotionButton
            onClick={() => onNavigate('app')}
            variant="default"
            size="pill"
            className="h-8 px-4 text-[12px] gap-1.5 shadow-xs"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </MotionButton>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#1D1D1F] dark:text-[#F5F5F7] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="md:hidden overflow-hidden border-b border-[#D2D2D7]/60 dark:border-white/10 bg-[#FBFBFD] dark:bg-[#161617] px-6 py-4 space-y-3 text-sm"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={link.action}
                className="block w-full text-left py-1.5 text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('login');
              }}
              className="block w-full text-left py-1.5 text-[#0071E3] font-medium"
            >
              Sign In
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
