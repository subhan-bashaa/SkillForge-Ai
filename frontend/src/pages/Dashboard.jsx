import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FiZap,
  FiBookOpen,
  FiCheckSquare,
  FiActivity,
  FiTrendingUp,
  FiPlusCircle,
  FiAward,
  FiClock,
  FiMessageSquare,
  FiLoader,
  FiChevronRight
} from 'react-icons/fi';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard states
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [newCourseName, setNewCourseName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const coursesRes = await api.get('/api/course', { params: { per_page: 4 } });
      setCourses(coursesRes.data.courses);

      const analyticsRes = await api.get('/api/analytics');
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to sync dashboard indices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickForge = (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    navigate(`/create-course?topic=${encodeURIComponent(newCourseName)}`);
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3 font-sans">
        <FiLoader className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm font-semibold uppercase tracking-wider">Loading workspace credentials...</span>
      </div>
    );
  }

  // Format weekly hours data for Recharts
  const chartData = Object.keys(analytics.weekly_hours).map((day) => ({
    name: day,
    hours: analytics.weekly_hours[day],
    // Add dummy XP calculation for the visual chart representation
    xp: analytics.weekly_hours[day] * 350 + (day === 'Sat' ? 1200 : day === 'Fri' ? 800 : 300)
  }));

  // Quick actions mapping
  const quickActions = [
    { title: 'Create Course', desc: 'Forge new roadmap', icon: FiPlusCircle, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', path: '/create-course' },
    { title: 'Continue learning', desc: 'Open active syllabus', icon: FiBookOpen, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', path: '/courses' },
    { title: 'AI Study Mentor', desc: 'Code debugging help', icon: FiMessageSquare, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', path: '/mentor' },
    { title: 'Generate Quiz', desc: 'Test syllabus memory', icon: FiAward, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', path: '/quiz' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-sans">
      <Sidebar />

      <main className="flex-grow p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 w-full">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">
              Welcome back, {currentUser?.name || 'Scholar'}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">Your AI learning modules and diagnostic metrics are active.</p>
          </div>
          {/* Quick Generate Roadmap Form */}
          <form onSubmit={handleQuickForge} className="flex gap-2">
            <input
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="Forge new topic..."
              className="bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FiPlusCircle /> Forge
            </button>
          </form>
        </div>

        {/* Dashboard Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Weekly XP</span>
              <FiAward className="text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{analytics.xp} XP</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">Level {Math.floor(analytics.xp / 1000) + 1}</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Hours Studied</span>
              <FiClock className="text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {Object.values(analytics.weekly_hours).reduce((a, b) => a + b, 0).toFixed(1)} hrs
            </div>
            <div className="text-[10px] text-indigo-400 font-semibold mt-1">Synced to study logs</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Roadmaps Active</span>
              <FiBookOpen className="text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{analytics.active_paths} Paths</div>
            <div className="text-[10px] text-slate-450 mt-1">{analytics.completed_modules} modules finished</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
              <FiZap className="text-amber-500" />
            </div>
            <div className="text-2xl font-black text-white">{analytics.streak} Days</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">Consistency goal met</div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:border-slate-700 hover:bg-slate-850/20 transition-all group"
                >
                  <div className={`p-2.5 rounded-lg border ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{action.title}</h4>
                    <p className="text-[10px] text-slate-500">{action.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytics charts and Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Progress Velocity Area Chart */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Study Velocity (XP Gained)</h3>
                <p className="text-xs text-slate-450 mt-0.5">Track your daily experience accumulation curve.</p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">7 Days</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #1E293B', borderRadius: '8px' }}
                    labelStyle={{ color: '#94A3B8' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Recent Activity</h3>
              <p className="text-xs text-slate-450 mb-5">History log of your workspace actions.</p>
              <div className="space-y-4">
                {analytics.activity_log.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <span className="p-1.5 bg-slate-950 border border-slate-800 text-indigo-400 rounded-lg mt-0.5">
                      <FiActivity className="w-3.5 h-3.5" />
                    </span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-200">{log.action}</div>
                      <div className="text-[11px] text-slate-400 truncate">{log.detail}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{log.time}</div>
                    </div>
                  </div>
                ))}
                {analytics.activity_log.length === 0 && (
                  <div className="py-4 text-center text-xs text-slate-550">
                    No recent activities recorded. Start building roadmaps.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Courses / Roadmaps List */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Active Roadmaps</h3>
              <p className="text-xs text-slate-450 mt-0.5">Your current AI-generated syllabus tracks.</p>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="text-xs text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              View All <FiChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course) => {
              const progressPct = course.completion_rate || 0;
              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all cursor-pointer hover:bg-slate-950"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="text-sm font-bold text-white truncate">{course.title}</h4>
                      <span className="text-[9px] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase">
                        {course.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-450">{course.total_modules} learning modules generated</p>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                      <span>Completed</span>
                      <span>{course.completed_lessons}/{course.total_lessons} ({progressPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {courses.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-slate-550 border border-dashed border-slate-850 rounded-xl">
                No active courses. Click "Forge" or "Create Course" to get started.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
