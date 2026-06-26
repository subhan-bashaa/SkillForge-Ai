import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiLock, FiUser, FiZap, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Social Auth Click Handler
  const [socialToast, setSocialToast] = useState('');
  const handleSocialClick = (provider) => {
    setSocialToast(`OAuth Integration Coming Soon (${provider})`);
    setTimeout(() => setSocialToast(''), 3000);
  };

  // Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        setLoginEmail('');
        setLoginPassword('');
        closeAuthModal();
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await register(registerName, registerEmail, registerPassword);
      if (res.success) {
        setSuccessMsg('Account created successfully! Please log in.');
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
        // Switch tab
        setActiveTab('login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      ></motion.div>

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 p-6 sm:p-8"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30 text-indigo-400">
            <FiZap className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">SkillForge AI</span>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs sm:text-sm flex items-center gap-2">
            <FiAlertCircle className="flex-shrink-0 w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs sm:text-sm flex items-center gap-2">
            <FiCheckCircle className="flex-shrink-0 w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
        {socialToast && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs sm:text-sm flex items-center gap-2">
            <FiZap className="flex-shrink-0 w-4 h-4 animate-bounce" />
            <span>{socialToast}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'login' ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <span
                  onClick={() => handleSocialClick('Reset Password')}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer font-medium"
                >
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-slate-950 border-slate-800 text-indigo-600 rounded focus:ring-0"
              />
              <label htmlFor="remember_me" className="ml-2 text-xs text-slate-400 select-none">
                Remember my credentials
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Logging in...' : 'Login to Workspace'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Alex Hughes"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="absolute bg-slate-900 px-3 text-xs text-slate-500 font-bold uppercase tracking-wider">Or continue with</span>
        </div>

        {/* Social Authentication */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialClick('Google')}
            className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-xl py-3 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <FcGoogle className="w-4 h-4" /> Google
          </button>
          <button
            onClick={() => handleSocialClick('GitHub')}
            className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-xl py-3 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <FaGithub className="w-4 h-4 text-white" /> GitHub
          </button>
        </div>
      </motion.div>
    </div>
  );
}
