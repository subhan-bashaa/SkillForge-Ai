import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import {
  FiZap,
  FiClock,
  FiBookOpen,
  FiCheckSquare,
  FiAward,
  FiActivity,
  FiLoader,
  FiAlertCircle
} from 'react-icons/fi';

export default function LearningAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/api/analytics');
        setData(response.data);
        setErrorMsg('');
      } catch (error) {
        console.error(error);
        setErrorMsg('Failed to load analytics records. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3 font-sans">
        <FiLoader className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm font-semibold uppercase tracking-wider">Compiling Analytics Logs...</span>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4 font-sans p-6">
        <FiAlertCircle className="w-12 h-12 text-rose-500" />
        <h3 className="text-xl font-bold text-white">Error loading analytics records</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">{errorMsg}</p>
      </div>
    );
  }

  // Format weekly hours data for Recharts
  const weeklyHoursData = Object.keys(data.weekly_hours).map((day) => ({
    name: day,
    hours: data.weekly_hours[day]
  }));

  // Format data for circular RadialBarChart
  const totalL = data.total_lessons || 1;
  const completedL = data.completed_lessons || 0;
  const rate = Math.round((completedL / totalL) * 100);
  const radialData = [
    {
      name: 'Lessons',
      value: rate,
      fill: '#6366F1'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-sans">
      <Sidebar />

      <main className="flex-grow p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white">Workspace Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Review study velocities, streaks, productivity indices, and certification badges.</p>
        </div>

        {/* Dashboard Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Overall XP</span>
              <FiAward className="text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{data.xp} Points</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">Level {Math.floor(data.xp / 1000) + 1} Scholar</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Productivity Score</span>
              <FiActivity className="text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">{data.productivity_score}%</div>
            <div className="text-[10px] text-indigo-400 font-semibold mt-1">Syllabus pacing is excellent</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Paths</span>
              <FiBookOpen className="text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{data.active_paths} Active</div>
            <div className="text-[10px] text-slate-450 mt-1">{data.completed_modules} modules finished</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Daily Streak</span>
              <FiZap className="text-amber-500" />
            </div>
            <div className="text-2xl font-black text-white">{data.streak} Days</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">Consistency goal met</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weekly Hours Bar Chart */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-200">Study hours tracker</h3>
              <p className="text-xs text-slate-450 mt-0.5">Total hours dedicated to lesson checklist items this week.</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyHoursData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #1E293B', borderRadius: '8px' }}
                    labelStyle={{ color: '#94A3B8' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Bar dataKey="hours" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completion Radial Chart */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Completion index</h3>
              <p className="text-xs text-slate-450 mt-0.5">Ratio of completed lessons over all roadmaps.</p>
            </div>
            <div className="h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={radialData}>
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-white">{rate}%</span>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Finished</p>
              </div>
            </div>
            <div className="text-center text-xs text-slate-400 font-semibold">
              {completedL} of {totalL} lessons checked off
            </div>
          </div>

        </div>

        {/* Heatmap Activity Calendar */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-200 mb-1">Consistency Calendar</h3>
          <p className="text-xs text-slate-450 mb-6">Activity heatmap representing studies over the last 30 days.</p>
          
          <div className="flex flex-wrap gap-2.5 max-w-full overflow-x-auto py-2">
            {data.heatmap.map((day, idx) => {
              // Levels: 0=slate-900, 1=indigo-900, 2=indigo-700, 3=indigo-500
              const levelColor = 
                day.count === 0 ? 'bg-slate-900 border border-slate-850' :
                day.count === 1 ? 'bg-indigo-900/40 border border-indigo-900 text-indigo-400' :
                day.count === 2 ? 'bg-indigo-700/60 border border-indigo-700 text-indigo-300' :
                'bg-indigo-600 border border-indigo-500 text-white';
              
              // Get day initial or number
              const dayObj = new Date(day.date);
              const dayStr = dayObj.getDate();

              return (
                <div
                  key={idx}
                  title={`${day.date}: ${day.count} milestones completed`}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-extrabold ${levelColor}`}
                >
                  {dayStr}
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements Badge Grid */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-200 mb-1">Achievement Badges</h3>
          <p className="text-xs text-slate-450 mb-6">Earn and unlock skill certification badges by completing courses and scoring on quizzes.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.badges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex items-center gap-3"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${badge.color || 'from-indigo-500 to-cyan-400'} text-white shadow-md`}>
                  <FiAward className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate">{badge.name}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{badge.description}</p>
                </div>
              </div>
            ))}
            {data.badges.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-slate-550">
                Generate roadmaps and complete modules to unlock badges.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
