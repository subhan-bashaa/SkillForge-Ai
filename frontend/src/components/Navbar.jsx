import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiCpu } from 'react-icons/fi';

export default function Navbar({ onAction }) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30 text-indigo-400">
              <FiCpu className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-white">
              SkillForge <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onAction}
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium px-4 py-2 cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={onAction}
              className="relative group overflow-hidden rounded-lg p-[1px] focus:outline-none cursor-pointer"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-lg group-hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative px-5 py-2 bg-slate-950 rounded-[7px] text-white text-sm font-medium transition-all duration-300 group-hover:bg-slate-950/20">
                Get Started
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none p-2 rounded-lg bg-slate-900 border border-slate-800"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-all duration-200"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onAction();
                  }}
                  className="w-full text-center text-slate-300 hover:text-white py-2 font-medium text-sm cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onAction();
                  }}
                  className="w-full relative group overflow-hidden rounded-lg p-[1px] cursor-pointer"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-lg"></span>
                  <div className="relative px-5 py-2.5 bg-slate-950 rounded-[7px] text-white text-sm font-semibold text-center transition-all duration-300 group-hover:bg-slate-950/50">
                    Get Started
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
