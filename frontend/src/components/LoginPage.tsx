import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AmbientGlow, FloatingGridPattern } from './ui/ambient-glow';
import { MotionButton } from './ui/button';

interface LoginPageProps {
  onNavigate: (route: 'landing' | 'login' | 'terms' | 'app') => void;
  onLoginSuccess: (userId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Email format validation helper
  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. developer@company.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    // Simulated network authentication against configured auth server
    setTimeout(() => {
      setLoading(false);
      // Success authentication
      onLoginSuccess(email.trim());
      onNavigate('app');
    }, 800);
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess('developer_enterprise_demo');
      onNavigate('app');
    }, 400);
  };

  return (
    <div className="relative min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200 flex flex-col justify-between overflow-x-hidden">
      <AmbientGlow />
      <FloatingGridPattern />

      <Navbar currentRoute="login" onNavigate={onNavigate} />

      <main className="flex-1 flex items-center justify-center px-6 py-16 md:py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] mx-auto text-center"
        >
          {/* Subtle Brand Identifier */}
          <div className="mb-8">
            <motion.button
              whileHover={{ x: -3 }}
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors mb-6 group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Overview</span>
            </motion.button>

            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              src="/logo-icon.png"
              alt="DocSupport Logo"
              className="w-12 h-12 rounded-2xl object-contain mx-auto mb-4 shadow-subtle border border-black/10 dark:border-white/15"
            />

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Sign in to DocSupport
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#6E6E73] dark:text-[#A1A1A6]">
              Enter your enterprise credentials to access your indexed codebases and knowledge library.
            </p>
          </div>

          {/* Authentication Form Card */}
          <div className="bg-[#FFFFFF] dark:bg-[#161617] border border-[#D2D2D7]/70 dark:border-white/10 rounded-2xl sm:rounded-3xl p-7 md:p-8 shadow-elevated text-left">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] dark:border-white/15 bg-[#FBFBFD] dark:bg-[#111112] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#86868B] absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset link will be sent to your registered organization email.');
                    }}
                    className="text-[11px] text-[#0071E3] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    disabled={loading}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#D2D2D7] dark:border-white/15 bg-[#FBFBFD] dark:bg-[#111112] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] p-0.5 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D2D2D7] text-[#0071E3] focus:ring-0 focus:outline-none"
                />
                <label htmlFor="remember-me" className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] select-none cursor-pointer">
                  Keep me signed in on this device
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <MotionButton
                  type="submit"
                  disabled={loading}
                  isLoading={loading}
                  variant="default"
                  size="pill"
                  className="w-full py-3 text-xs font-medium gap-2 shadow-sm"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </MotionButton>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#D2D2D7]/50 dark:border-white/10"></div>
              </div>
              <span className="relative px-3 bg-[#FFFFFF] dark:bg-[#161617] text-[11px] text-[#86868B]">
                or
              </span>
            </div>

            {/* Instant Demo Access */}
            <MotionButton
              onClick={handleDemoLogin}
              disabled={loading}
              variant="outline"
              size="pill"
              className="w-full py-2.5 text-xs font-medium gap-2"
            >
              <span>Explore as Guest Developer</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#86868B]" />
            </MotionButton>
          </div>

          {/* Legal Footnote */}
          <p className="mt-8 text-[11px] text-[#86868B] dark:text-[#A1A1A6] leading-relaxed">
            By signing in, you agree to our{' '}
            <button
              onClick={() => onNavigate('terms')}
              className="text-[#0071E3] hover:underline cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            . Your repository access tokens and code snippets are handled under strict ephemeral isolation.
          </p>
        </motion.div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
