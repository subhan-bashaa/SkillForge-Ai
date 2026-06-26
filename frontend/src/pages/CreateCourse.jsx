import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api';
import {
  FiArrowLeft,
  FiZap,
  FiCpu,
  FiLoader,
  FiAlertTriangle,
  FiBookOpen,
  FiClock,
  FiSliders,
  FiGlobe,
  FiFileText
} from 'react-icons/fi';

export default function CreateCourse() {
  const navigate = useNavigate();

  // Form State
  const [goal, setGoal] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [duration, setDuration] = useState('3 Months');
  const [dailyHours, setDailyHours] = useState('2 Hours');
  const [language, setLanguage] = useState('JavaScript');
  const [learningStyle, setLearningStyle] = useState('Hands-on');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [notes, setNotes] = useState('');

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!goal.trim()) {
      errors.goal = 'Course Goal is required.';
    }
    if (!targetRole.trim()) {
      errors.targetRole = 'Target Job Role is required.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!validateForm() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg('');

    const payload = {
      goal,
      role: targetRole,
      level,
      duration,
      daily_hours: dailyHours,
      language,
      learning_style: learningStyle,
      difficulty,
      notes
    };

    try {
      setLoadingStep('Parsing your learning objectives...');
      await new Promise(r => setTimeout(r, 600));

      setLoadingStep('Analyzing skill dependencies...');
      await new Promise(r => setTimeout(r, 600));

      setLoadingStep('Compiling custom syllabus modules...');
      await new Promise(r => setTimeout(r, 800));

      setLoadingStep('Saving roadmap structure...');
      await new Promise(r => setTimeout(r, 600));

      // POST Request to Flask Backend under singular /api/course/generate
      await api.post('/api/course/generate', payload);

      // Redirect user directly to My Courses page
      navigate('/courses');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Unable to generate course roadmap. Ensure your Flask server is running.');
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-sans">
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 w-full">
        
        {/* Back Button & Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 bg-slate-900 border border-slate-800 text-slate-450 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">Create AI Learning Path</h1>
            <p className="text-slate-400 text-sm mt-0.5">Let AI configure your custom learning syllabus, modules, and checklists.</p>
          </div>
        </div>

        {/* Error Banners */}
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-sm flex items-center gap-3 animate-pulse">
            <FiAlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Generator Form */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <form onSubmit={handleGenerate} className="space-y-6">
            
            {/* Input Goal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FiZap className="text-indigo-400" /> Course Goal
              </label>
              <textarea
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value);
                  if (validationErrors.goal) setValidationErrors(prev => ({ ...prev, goal: null }));
                }}
                placeholder="What exactly do you want to learn? (e.g. Master React 19 concurrent state hooks, Build full stack web apps...)"
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-650 focus:outline-none transition-colors resize-none"
              />
              {validationErrors.goal && (
                <p className="text-rose-400 text-xs font-semibold">{validationErrors.goal}</p>
              )}
            </div>

            {/* Grid of options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Target Role */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Target Job Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => {
                    setTargetRole(e.target.value);
                    if (validationErrors.targetRole) setValidationErrors(prev => ({ ...prev, targetRole: null }));
                  }}
                  placeholder="e.g. Frontend Architect"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors"
                />
                {validationErrors.targetRole && (
                  <p className="text-rose-400 text-xs font-semibold">{validationErrors.targetRole}</p>
                )}
              </div>

              {/* Current Knowledge Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Current Knowledge Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Duration selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                </select>
              </div>

              {/* Study Hours */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Study Hours Per Day
                </label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="1 Hour">1 Hour</option>
                  <option value="2 Hours">2 Hours</option>
                  <option value="4 Hours">4 Hours</option>
                  <option value="6+ Hours">6+ Hours</option>
                </select>
              </div>

              {/* Programming Language */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Preferred Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="JavaScript">JavaScript / TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="Rust">Rust</option>
                  <option value="Go">Go Language</option>
                  <option value="Java">Java</option>
                </select>
              </div>

              {/* Learning Style */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Learning Style
                </label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Hands-on">Hands-on (Projects/Code exercises)</option>
                  <option value="Video">Video (Interactive lectures)</option>
                  <option value="Reading">Reading (Docs/Tutorials)</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Beginner">Beginner level</option>
                  <option value="Intermediate">Intermediate level</option>
                  <option value="Advanced">Advanced level</option>
                </select>
              </div>

            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FiFileText className="text-cyan-400" /> Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="List any extra requirements, concepts you want to focus on, or project types you'd like generated..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-650 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-bold py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Forging AI Roadmap...</span>
                </>
              ) : (
                <>
                  <FiCpu className="w-5 h-5" />
                  <span>Generate AI Roadmap</span>
                </>
              )}
            </button>
          </form>

          {/* Loading status overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-25">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl mb-4 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                <FiLoader className="w-8 h-8 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{loadingStep}</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-xs">Our custom Llama 3.3 model is compiling optimal learning tracks based on active job indexes.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
