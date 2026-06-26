import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight,
  FiTerminal,
  FiCompass,
  FiMessageSquare,
  FiTrendingUp,
  FiBookOpen,
  FiZap,
  FiAward,
  FiDatabase,
  FiStar,
  FiCpu,
  FiShield,
  FiCheckCircle,
  FiSettings,
  FiLock,
  FiServer,
  FiCode,
} from 'react-icons/fi';

import Navbar from './components/Navbar';
import DashboardPreview from './components/DashboardPreview';
import Accordion from './components/Accordion';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';

// Custom lightweight Intersection Observer Hook
function useInView({ triggerOnce = false, threshold = 0.1 } = {}) {
  const [inView, setInView] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && triggerOnce) {
          observer.unobserve(ref);
        }
      },
      { threshold }
    );

    observer.observe(ref);
    return () => {
      if (ref && !triggerOnce) {
        observer.unobserve(ref);
      }
    };
  }, [ref, threshold, triggerOnce]);

  return [setRef, inView];
}

export default function Landing() {
  const [heroInput, setHeroInput] = useState('Full Stack Developer');
  const [generatedSteps, setGeneratedSteps] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const { openAuthModal } = useAuth();

  // AI Mentor Mock Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'mentor', text: 'Hey there! What skill are we forging today?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isMentorTyping, setIsMentorTyping] = useState(false);

  // Handle Hero Mock Generation
  const handleGenerateRoadmap = (e) => {
    e.preventDefault();
    if (!heroInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedSteps([]);
    setGenerationProgress(0);

    const steps = [
      { id: 1, title: 'Foundational Knowledge', desc: 'Core syntax, algorithms, and key paradigms.' },
      { id: 2, title: 'Intermediate Specialization', desc: 'State management, routing, and APIs.' },
      { id: 3, title: 'Database & Systems design', desc: 'Relational data modeling, caching, scaling.' },
      { id: 4, title: 'Production Capstone', desc: 'Deploying, monitoring, CI/CD setup.' },
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        const nextProgress = prev + 25;
        setGeneratedSteps((prevSteps) => [...prevSteps, steps[currentStepIndex]]);
        currentStepIndex++;
        return nextProgress;
      });
    }, 800);
  };

  // Pre-populate roadmap on load
  useEffect(() => {
    setGeneratedSteps([
      { id: 1, title: 'Foundational Knowledge', desc: 'Core syntax, algorithms, and key paradigms.' },
      { id: 2, title: 'Intermediate Specialization', desc: 'State management, routing, and APIs.' },
      { id: 3, title: 'Database & Systems design', desc: 'Relational data modeling, caching, scaling.' },
    ]);
  }, []);

  // Handle AI Mentor Chat
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isMentorTyping) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsMentorTyping(true);

    // Mentor auto-response
    setTimeout(() => {
      let reply = "That's a great question! Forging that skill requires breaking it down into sub-modules. Let me generate a personalized quiz to test your baseline.";
      if (chatInput.toLowerCase().includes('react')) {
        reply = "React 19 introduces Server Components natively. You should focus your learning path on Hydration, Server-Side Rendering, and the new actions hook API!";
      } else if (chatInput.toLowerCase().includes('python')) {
        reply = "Python is standard for AI. I recommend starting with NumPy and Pandas, then building simple feedforward networks in PyTorch.";
      }
      setChatMessages((prev) => [...prev, { sender: 'mentor', text: reply }]);
      setIsMentorTyping(false);
    }, 1500);
  };

  // Scroll reveal utilities
  const ScrollReveal = ({ children }) => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

    return (
      <motion.div
        ref={ref}
        animate={inView ? 'visible' : 'hidden'}
        initial="hidden"
        transition={{ duration: 0.6, ease: 'easeOut' }}
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 40 },
        }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative">
      <Navbar onAction={openAuthModal} />

      <AuthModal />

      {/* Hero Section Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[10%] w-[35%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[5%] right-[10%] w-[35%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-slate-950 to-slate-950"></div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
            >
              <FiZap className="animate-pulse text-amber-400" /> Recruiter Portfolio Preview
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white max-w-xl"
            >
              Build Personalized Learning Paths{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                with AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg"
            >
              Generate complete learning roadmaps, track progress, interact with an AI mentor, and accelerate your career using personalized AI-generated courses.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <button
                onClick={openAuthModal}
                className="w-full sm:w-auto text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
              >
                Get Started Free
              </button>
              <button
                onClick={openAuthModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-200 font-bold px-8 py-4 rounded-xl hover:bg-slate-850 hover:text-white transition-all duration-300 cursor-pointer"
              >
                Watch Demo
              </button>
            </motion.div>

            {/* Social Proof Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 grid grid-cols-3 gap-6 sm:gap-8 border-t border-slate-900 pt-8 w-full max-w-md"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">94%</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Study speedup</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">45k+</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Active Minds</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">4.9/5</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">User Rating</div>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Visual (Interactive Simulator) */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Top Bar Decoration */}
              <div className="flex items-center gap-1.5 pb-4 border-b border-slate-800/60 mb-5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-xs text-slate-500 ml-2 font-mono flex items-center gap-1">
                  <FiTerminal /> skillforge-ai-core.sh
                </span>
              </div>

              {/* Input for Simulator */}
              <form onSubmit={handleGenerateRoadmap} className="flex gap-2 mb-6">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={heroInput}
                    onChange={(e) => setHeroInput(e.target.value)}
                    placeholder="Enter what you want to learn..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors duration-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? 'Forging...' : 'Forge'} <FiArrowRight />
                </button>
              </form>

              {/* Progress Bar (Visual indicator of generation) */}
              {isGenerating && (
                <div className="mb-6 space-y-1">
                  <div className="flex justify-between text-xs text-indigo-400 font-mono">
                    <span>Synthesizing modules...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${generationProgress}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    ></motion.div>
                  </div>
                </div>
              )}

              {/* Generated Roadmaps */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Personalized Roadmap: {heroInput || 'Custom Path'}
                </h4>

                <div className="relative pl-6 border-l border-slate-800 space-y-5 py-1">
                  {generatedSteps.map((step, idx) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500/10 border-2 border-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                      </span>
                      <h5 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        {step.title}
                        {idx === generatedSteps.length - 1 && !isGenerating && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                            Ready
                          </span>
                        )}
                      </h5>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating Widget Mockup */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute -right-6 bottom-10 bg-slate-950/95 border border-slate-800 p-3.5 rounded-xl shadow-2xl flex items-center gap-3 hidden sm:flex pointer-events-none"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                  <FiCompass className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NEXT UP</div>
                  <div className="text-xs font-bold text-white">Algorithms II</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Trusted By Section */}
      <section className="border-y border-slate-900 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <p className="text-center text-slate-500 text-xs font-semibold uppercase tracking-widest mb-8">
          Trusted by engineers at top technology teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-1.5 opacity-55 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            <span className="font-sans font-bold text-lg text-white">Google</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-55 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            <span className="font-sans font-bold text-lg text-white">Microsoft</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-55 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            <span className="font-sans font-bold text-lg text-white">Amazon</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-55 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            <span className="font-sans font-bold text-lg text-white">Meta</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-55 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            <span className="font-sans font-black text-lg text-white">OpenAI</span>
          </div>
        </div>
      </section>

      {/* Why SkillForge AI? Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-b border-slate-900">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
              Value Proposition
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-4 mb-4">
              Why SkillForge AI?
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              We replace generic tutorials with high-fidelity, adaptive learning assets designed to elevate developer capabilities.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <ScrollReveal>
            <div className="group h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/30 text-indigo-400 w-fit mb-5 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                  <FiTerminal className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI-Powered Roadmaps</h3>
                <p className="text-slate-450 text-xs sm:text-sm leading-relaxed">
                  Generate customized, multi-phase learning paths mapped dynamically around your career goals and current skill gaps.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2 */}
          <ScrollReveal>
            <div className="group h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30 text-purple-400 w-fit mb-5 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                  <FiCompass className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Personalized Experience</h3>
                <p className="text-slate-455 text-xs sm:text-sm leading-relaxed">
                  Content adapts in real-time. Advance quickly past materials you know and focus on the technical details you need.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 3 */}
          <ScrollReveal>
            <div className="group h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400 w-fit mb-5 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                  <FiTrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Progress Analytics</h3>
                <p className="text-slate-460 text-xs sm:text-sm leading-relaxed">
                  Monitor XP gains, daily study streaks, and completion rates on a premium interactive developer dashboard.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 4 */}
          <ScrollReveal>
            <div className="group h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400 w-fit mb-5 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                  <FiMessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Mentor Assistance</h3>
                <p className="text-slate-465 text-xs sm:text-sm leading-relaxed">
                  Interact with an on-demand AI programming mentor to review code snippets, debug errors, and verify concepts.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section (Project Highlights) */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-b border-slate-900">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
              System Core
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-4 mb-4">
              Project Highlights
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Explore the core functional features built to deliver the ultimate engineering study experience.
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Highlight 1 */}
          <ScrollReveal>
            <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 hover:border-slate-700/80 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/30 text-indigo-400 w-fit mb-6">
                  <FiDatabase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Course Generator</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Synthesize structured modules complete with rich text explanations, code playgrounds, and source link compilations based on simple prompts.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Highlight 2 */}
          <ScrollReveal>
            <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 hover:border-slate-700/80 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30 text-purple-400 w-fit mb-6">
                  <FiCompass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Learning Analytics Dashboard</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Visualize velocity curves and active progress milestones through clean interactive mock dashboard analytics centers.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Highlight 3: Interactive Chat Preview */}
          <ScrollReveal>
            <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 transition-all duration-300 lg:col-span-1 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-cyan-400">
                    <FiMessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">AI Mentor Chat</h3>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Online Now</span>
                  </div>
                </div>

                {/* Mock Chat Content */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 h-[150px] overflow-y-auto space-y-3 font-mono text-[11px] mb-4 scrollbar-thin">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-2.5 py-1.5 rounded-lg max-w-[85%] ${
                        msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isMentorTyping && (
                    <div className="text-slate-500 animate-pulse">Mentor is thinking...</div>
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="flex gap-1.5">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask mentor (e.g., Python AI)..."
                    className="flex-grow bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </ScrollReveal>

          {/* Highlight 4 */}
          <ScrollReveal>
            <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 hover:border-slate-700/80 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400 w-fit mb-6">
                  <FiAward className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Quiz Generation System</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Auto-generate multiple-choice and short-answer quizzes dynamically as you complete lessons to benchmark and solidify key concepts.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Highlight 5 */}
          <ScrollReveal>
            <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 hover:border-slate-700/80 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400 w-fit mb-6">
                  <FiBookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Personalized Roadmaps</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Input any complex objective (e.g. "Rust system runtime audits") and watch the engine outline targeted progression pathways.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Highlight 6 */}
          <ScrollReveal>
            <div className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 hover:border-slate-700/80 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400 w-fit mb-6">
                  <FiTrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Progress Tracking</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Quantify study velocity metrics, aggregate weekly course completions, and track streaks to reinforce daily coding habits.
                </p>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-950 border-b border-slate-900 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-4 mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 text-base">
              Start learning complex tech skills in four simple, automated steps.
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          {/* Connecting line for desktop timeline */}
          <div className="absolute top-[3.25rem] left-[12%] right-[12%] h-[2px] bg-slate-800 hidden md:block z-0"></div>

          {/* Step 1 */}
          <ScrollReveal>
            <div className="flex flex-col items-center md:items-start text-center md:text-left relative z-10 group">
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center font-bold text-lg text-white mb-6 group-hover:border-indigo-500 group-hover:text-indigo-400 shadow-xl transition-all duration-300">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Enter your goal</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Describe what skill or career outcome you want (e.g. "Solidity contract auditing").
              </p>
            </div>
          </ScrollReveal>

          {/* Step 2 */}
          <ScrollReveal>
            <div className="flex flex-col items-center md:items-start text-center md:text-left relative z-10 group">
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center font-bold text-lg text-white mb-6 group-hover:border-purple-500 group-hover:text-purple-400 shadow-xl transition-all duration-300">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI generates roadmap</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our LLM dynamically schemas multi-module roadmaps with tutorials, resources, and coding labs.
              </p>
            </div>
          </ScrollReveal>

          {/* Step 3 */}
          <ScrollReveal>
            <div className="flex flex-col items-center md:items-start text-center md:text-left relative z-10 group">
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center font-bold text-lg text-white mb-6 group-hover:border-cyan-500 group-hover:text-cyan-400 shadow-xl transition-all duration-300">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Learn and complete modules</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Follow your structured schedule, take interactive custom lessons, and complete mock tasks.
              </p>
            </div>
          </ScrollReveal>

          {/* Step 4 */}
          <ScrollReveal>
            <div className="flex flex-col items-center md:items-start text-center md:text-left relative z-10 group">
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center font-bold text-lg text-white mb-6 group-hover:border-emerald-500 group-hover:text-emerald-400 shadow-xl transition-all duration-300">
                4
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Track progress and improve</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Clear checkpoints, generate custom recap quizzes, and analyze learning data insights.
              </p>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Dashboard Preview Section (Analytics Hub) */}
      <section id="dashboard-preview" className="py-24 bg-slate-950 border-b border-slate-900 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
              SaaS Interface
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-4 mb-4">
              Step Into Your AI Learning Dashboard
            </h2>
            <p className="text-slate-400 text-base">
              A premium workspace detailing interactive course lists, progress charts, streaks, and smart analytics.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <DashboardPreview />
        </ScrollReveal>
      </section>

      {/* "Built With" Technology Stack Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-b border-slate-900">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
              Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-4 mb-4">
              Built With
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Explore the robust, scalable technology stack powering the SkillForge AI developer curriculum engine.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {/* Frontend */}
          <ScrollReveal>
            <div className="h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Frontend</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <FiCode className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-100">React</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <FiCpu className="text-cyan-400" />
                  <span className="text-xs font-bold text-slate-100">Tailwind CSS</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Backend */}
          <ScrollReveal>
            <div className="h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Backend</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <FiServer className="text-emerald-400" />
                  <span className="text-xs font-bold text-slate-100">Flask</span>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <FiDatabase className="text-cyan-400" />
                  <span className="text-xs font-bold text-slate-100">SQLite</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* AI Models */}
          <ScrollReveal>
            <div className="h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">AI Core</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <FiZap className="text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-100">Gemini API</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Authentication */}
          <ScrollReveal>
            <div className="h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all duration-300">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">Auth</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <FiLock className="text-rose-400" />
                  <span className="text-xs font-bold text-slate-100">JWT Token</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Deployment */}
          <ScrollReveal>
            <div className="h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Deployment</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <FiServer className="text-blue-400" />
                  <span className="text-xs font-bold text-slate-100">Render Cloud</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-950 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-b border-slate-900">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              What Our Members Say
            </h2>
            <p className="text-slate-400 text-base">
              Discover how developers and builders are cutting learning curves in half.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <ScrollReveal>
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 hover:border-slate-700/80 transition-colors duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => <FiStar key={i} className="fill-amber-400/20" />)}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                  "SkillForge AI generated a full Rust system engineering path that perfectly targeted my weak points. I was able to build a performant multithreaded runtime in just 3 weeks."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-6 border-t border-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                  AH
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Alex Hughes</h4>
                  <span className="text-xs text-slate-500">Staff Software Engineer</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Testimonial 2 */}
          <ScrollReveal>
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 hover:border-slate-700/80 transition-colors duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => <FiStar key={i} className="fill-amber-400/20" />)}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                  "The mock AI mentor chat is like having a Lead Developer over your shoulder. When I got stuck on a complex React state update, the explanations were instantly parsed and useful."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-6 border-t border-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-rose-400 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                  SL
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sarah Lim</h4>
                  <span className="text-xs text-slate-500">Frontend Engineer at Vercel</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Testimonial 3 */}
          <ScrollReveal>
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 hover:border-slate-700/80 transition-colors duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => <FiStar key={i} className="fill-amber-400/20" />)}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                  "I was switching from finance to software development and found generic tutorials overwhelming. SkillForge mapped custom courses specifically matching junior roles. Got hired in 4 months!"
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-6 border-t border-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                  MR
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Marcus Reed</h4>
                  <span className="text-xs text-slate-500">Junior Full Stack Developer</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="about" className="py-24 bg-slate-950 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10 border-b border-slate-900">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Got questions? We've got answers. Reach out to support if you need extra details.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900 rounded-2xl px-6 sm:px-8 py-4">
            <Accordion
              question="How does the AI course generator compile information?"
              answer="Our model pulls from thousands of reputable technical documentations, online tutorials, textbooks, and open-source packages. It synthesizes these into structured markdown courses complete with code blocks, key concept takeaways, and practice exercises, all tailored to your specified goal."
            />
            <Accordion
              question="Is the AI mentor chat available on the free tier?"
              answer="Free accounts have a limited amount of chat credits to experience the AI mentor. For unlimited, real-time feedback with personalized memory of your code projects, we recommend upgrading to the Pro Alchemist plan."
            />
            <Accordion
              question="Can I customize a roadmap if the AI generates something I already know?"
              answer="Absolutely. You can mark specific modules as 'Completed' or tell the AI mentor: 'I already know React state, replace module 2 with advanced redux toolkit.' The AI will immediately restructure the path and save your changes."
            />
            <Accordion
              question="Does SkillForge AI provide verified certificates?"
              answer="Yes, when you complete all modules in a roadmap and pass the final course quizzes, you receive a shareable certificate linked to a unique verification page. This can be embedded in your portfolio, GitHub profile, or LinkedIn."
            />
            <Accordion
              question="Can I cancel my subscription at any time?"
              answer="Yes! There are no long-term contracts. You can downgrade to the free tier or cancel your subscription at any time directly through your billing portal settings."
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-slate-950 relative overflow-hidden z-10">
        {/* Glow Spheres */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6">
              Start Learning Smarter{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                with AI today
              </span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of developers, designers, and tech builders who are mapping custom curricula and fast-tracking their careers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={openAuthModal}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 cursor-pointer"
              >
                Start Free Now
              </button>
              <button
                onClick={openAuthModal}
                className="w-full sm:w-auto bg-slate-900 border border-slate-800 text-slate-200 font-bold px-8 py-4 rounded-xl hover:bg-slate-850 hover:text-white transition-all duration-300 cursor-pointer"
              >
                Book Enterprise Demo
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 mb-12">
          
          {/* Brand Info Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30 text-indigo-400">
                <FiCpu className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">SkillForge AI</span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs">
              Smarter engineering paths, personalized quiz structures, and real-time mentor feedback designed to accelerate technical capabilities.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors">Course Gen</a></li>
              <li><a href="#features" className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors">AI Mentor</a></li>
              <li><a href="#dashboard-preview" className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors">Analytics Hub</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors">About Us</a></li>
              <li><span className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors cursor-pointer">Careers</span></li>
              <li><span className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors cursor-pointer">Blog</span></li>
              <li><span className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors cursor-pointer">Press kit</span></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors cursor-pointer">Help Center</span></li>
              <li><span className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors cursor-pointer">Developer API</span></li>
              <li><span className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors cursor-pointer">Security SLA</span></li>
              <li><span className="text-slate-500 hover:text-slate-300 text-xs sm:text-sm transition-colors cursor-pointer">Privacy Policy</span></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-slate-900/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} SkillForge AI Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-slate-600 hover:text-slate-400 text-xs transition-colors cursor-pointer">Terms of Service</span>
            <span className="text-slate-600 hover:text-slate-400 text-xs transition-colors cursor-pointer">Privacy settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
