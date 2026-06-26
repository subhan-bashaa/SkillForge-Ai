import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiZap,
  FiBookOpen,
  FiPlusCircle,
  FiActivity,
  FiMessageSquare,
  FiAward,
  FiUser,
  FiSettings,
  FiLogOut,
  FiClock,
  FiPlay,
  FiPause,
  FiRefreshCw
} from 'react-icons/fi';

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [streak, setStreak] = useState(18);

  // Pomodoro Timer States
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('Work'); // Work, Break

  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Toggle Mode on completion
      if (timerMode === 'Work') {
        alert('Pomodoro session completed! Take a break.');
        setTimerMode('Break');
        setTimeLeft(300); // 5 mins
      } else {
        alert('Break completed! Back to work.');
        setTimerMode('Work');
        setTimeLeft(1500); // 25 mins
      }
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, timerMode]);

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(timerMode === 'Work' ? 1500 : 300);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: FiActivity, path: '/dashboard' },
    { name: 'Create Course', icon: FiPlusCircle, path: '/create-course' },
    { name: 'My Courses', icon: FiBookOpen, path: '/courses' },
    { name: 'AI Mentor', icon: FiMessageSquare, path: '/mentor' },
    { name: 'AI Quizzes', icon: FiAward, path: '/quiz' },
    { name: 'Analytics', icon: FiActivity, path: '/analytics' },
    { name: 'Profile', icon: FiUser, path: '/profile' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between flex-shrink-0 z-40">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30 text-indigo-400">
            <FiZap className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-sans font-bold text-lg text-white">SkillForge AI</span>
        </div>

        {/* User Profile Card */}
        <div className="p-4 bg-slate-950/60 border border-slate-800/50 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
            {currentUser?.name?.substring(0, 2) || 'SF'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">{currentUser?.name || 'Scholar'}</h4>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
              XP: {currentUser?.xp || 0}
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <nav className="space-y-1">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Workspace</span>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Pomodoro Timer widget */}
        <div className="bg-slate-950/50 p-4 border border-slate-800/60 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
            <span className="uppercase tracking-wider">Pomodoro Timer</span>
            <FiClock className={timerRunning ? 'text-indigo-400 animate-spin' : 'text-slate-500'} />
          </div>
          <div className="text-center py-2">
            <span className="text-xl font-mono font-bold text-white tracking-widest">
              {formatTime(timeLeft)}
            </span>
            <div className="text-[9px] font-semibold text-indigo-400 uppercase mt-0.5">
              {timerMode} Session
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              onClick={toggleTimer}
              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-md cursor-pointer transition-colors"
            >
              {timerRunning ? <FiPause className="w-3.5 h-3.5" /> : <FiPlay className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-md cursor-pointer transition-colors"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-8 w-full inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-rose-500/10 border border-slate-850 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold py-3 rounded-xl text-sm transition-all cursor-pointer"
      >
        <FiLogOut /> Logout
      </button>
    </aside>
  );
}
