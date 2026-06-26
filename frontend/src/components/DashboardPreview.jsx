import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiTrendingUp, FiAward, FiBookOpen, FiZap, FiCheckCircle } from 'react-icons/fi';

const progressData = [
  { name: 'Mon', hours: 1.5, courses: 1 },
  { name: 'Tue', hours: 2.8, courses: 1 },
  { name: 'Wed', hours: 4.2, courses: 2 },
  { name: 'Thu', hours: 3.0, courses: 2 },
  { name: 'Fri', hours: 5.5, courses: 3 },
  { name: 'Sat', hours: 6.8, courses: 4 },
  { name: 'Sun', hours: 4.0, courses: 4 },
];

const completionData = [
  { name: 'Python AI', progress: 85 },
  { name: 'React Native', progress: 60 },
  { name: 'System Design', progress: 40 },
  { name: 'UX/UI', progress: 95 },
];

export default function DashboardPreview() {
  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
      {/* Background glow effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FiAward className="text-indigo-400" /> Personalized Learning Hub
          </h3>
          <p className="text-slate-400 text-sm">Welcome back! Your AI mentor suggests studying <span className="text-cyan-400 font-semibold">Generative AI Models</span> today.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 border border-slate-800/80 rounded-xl">
          <FiZap className="text-amber-500 fill-amber-500/20 animate-bounce" />
          <div>
            <div className="text-xs text-slate-400 font-medium">STREAK</div>
            <div className="text-sm font-bold text-white">18 Days Active</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-slate-950/50 p-4 border border-slate-800/40 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Weekly XP</span>
            <FiTrendingUp className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">4,850</div>
          <div className="text-xs text-emerald-400 mt-1 font-medium">+12% vs last week</div>
        </div>

        <div className="bg-slate-950/50 p-4 border border-slate-800/40 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hrs Learned</span>
            <FiBookOpen className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">27.8 hrs</div>
          <div className="text-xs text-indigo-400 mt-1 font-medium">Daily target achieved</div>
        </div>

        <div className="bg-slate-950/50 p-4 border border-slate-800/40 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quizzes Passed</span>
            <FiCheckCircle className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">14 / 15</div>
          <div className="text-xs text-cyan-400 mt-1 font-medium">93% success rate</div>
        </div>

        <div className="bg-slate-950/50 p-4 border border-slate-800/40 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rank</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">PRO</span>
          </div>
          <div className="text-2xl font-black text-white">Top 2%</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Global leaderboard</div>
        </div>
      </div>

      {/* Grid of charts and course statuses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Hours Area Chart */}
        <div className="lg:col-span-2 bg-slate-950/40 p-4 border border-slate-800/60 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-200">Study Velocity (Hours/Day)</h4>
            <span className="text-xs text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-md">Last 7 Days</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94A3B8' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Learning Paths Completion */}
        <div className="bg-slate-950/40 p-4 border border-slate-800/60 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-200">Active Roadmaps</h4>
            <span className="text-xs text-indigo-400 hover:underline cursor-pointer">View All</span>
          </div>
          <div className="space-y-4">
            {completionData.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>{item.name}</span>
                  <span className="text-cyan-400">{item.progress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Weekly Quiz Status</span>
            <span className="text-emerald-400 font-bold uppercase">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
