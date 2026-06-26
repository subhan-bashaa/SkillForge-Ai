import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api';
import {
  FiUser,
  FiAward,
  FiZap,
  FiClock,
  FiBookOpen,
  FiCheckCircle,
  FiDownload,
  FiEdit,
  FiMoon,
  FiSun,
  FiLoader
} from 'react-icons/fi';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/profile');
      setProfile(res.data);
      setName(res.data.user.name);
      setEmail(res.data.user.email);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/api/profile', { name, email });
      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, name: res.data.user.name, email: res.data.user.email }
      }));
      setIsEditing(false);
      alert('Profile updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed.');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Toggle DOM classes for Tailwind/CSS theme rules
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  };

  const handleDownloadCertificate = (cert) => {
    // Generate text completion certificate
    let certDoc = `========================================================================\n`;
    certDoc += `                    SKILLFORGE AI SPECIALIZATION STATUS                 \n`;
    certDoc += `========================================================================\n\n`;
    certDoc += `This certifies that\n\n`;
    certDoc += `                         ${profile.user.name}\n\n`;
    certDoc += `has successfully completed the AI-engineered syllabus specialization:\n\n`;
    certDoc += `               "${cert.course_title}"\n\n`;
    certDoc += `Earned on: ${cert.completed_at}\n`;
    certDoc += `Credential Verification Identifier: ${cert.credential_id}\n\n`;
    certDoc += `========================================================================\n`;
    certDoc += `Verified by SkillForge AI Core Engine. Sync ID: PG-${cert.id}\n`;
    certDoc += `========================================================================\n`;

    const blob = new Blob([certDoc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SkillForge-Certificate-${cert.credential_id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3 font-sans">
        <FiLoader className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm font-semibold uppercase tracking-wider">Syncing Profile Details...</span>
      </div>
    );
  }

  // Calculate XP Level bounds
  const currentXP = profile.xp || 0;
  const currentLevel = Math.floor(currentXP / 1000) + 1;
  const xpInLevel = currentXP % 1000;
  const xpLevelPct = Math.round((xpInLevel / 1000) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-sans">
      <Sidebar />

      <main className="flex-grow p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white">Student Profile</h1>
            <p className="text-slate-400 text-sm mt-1">Manage user information, review certificate credentials, and track XP achievements.</p>
          </div>
          
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-xl cursor-pointer hover:bg-slate-850 transition-colors"
          >
            {theme === 'dark' ? <FiSun className="text-amber-400" /> : <FiMoon className="text-slate-400" />}
          </button>
        </div>

        {/* User Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
          
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 text-white font-extrabold flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/10">
            {profile.user.name.substring(0, 2).toUpperCase()}
          </div>

          <div className="flex-grow text-center sm:text-left space-y-3 z-10 w-full">
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3 max-w-sm">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="Username"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="Email Address"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 px-3.5 py-2 rounded-lg cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-black text-white">{profile.user.name}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <FiEdit className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-450 text-xs font-semibold">{profile.user.email}</p>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  Joined: {new Date(profile.user.created_at).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Level Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-450">
                <span>Scholar Level {currentLevel}</span>
                <span>{xpInLevel} / 1000 XP ({xpLevelPct}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850/80">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${xpLevelPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
            <FiZap className="w-8 h-8 text-amber-400" />
            <div>
              <h4 className="text-xl font-black text-white">{profile.streak} Days</h4>
              <p className="text-xs text-slate-500">Active Study Streak</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
            <FiAward className="w-8 h-8 text-indigo-400" />
            <div>
              <h4 className="text-xl font-black text-white">{profile.badges.length} Badges</h4>
              <p className="text-xs text-slate-500">Milestone Achievements</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
            <FiCheckCircle className="w-8 h-8 text-emerald-400" />
            <div>
              <h4 className="text-xl font-black text-white">{profile.certificates.length} Courses</h4>
              <p className="text-xs text-slate-500">Specializations Completed</p>
            </div>
          </div>
        </div>

        {/* Certificates Earned */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <h3 className="text-base font-extrabold text-white mb-1">Earned Certification Credentials</h3>
          <p className="text-xs text-slate-450 mb-5">Earn digital credentials by fully completing 100% of generated modules and lesson checklists.</p>
          
          <div className="space-y-3">
            {profile.certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-white leading-normal">{cert.course_title}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Credential ID: {cert.credential_id} • Date: {cert.completed_at}</p>
                </div>
                <button
                  onClick={() => handleDownloadCertificate(cert)}
                  className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-[11px] font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <FiDownload /> Download Certificate
                </button>
              </div>
            ))}

            {profile.certificates.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-550 border border-dashed border-slate-850 rounded-xl">
                Finish all lesson checks in a course roadmap to unlock downloadable completion credentials.
              </div>
            )}
          </div>
        </div>

        {/* Badges Earned */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <h3 className="text-base font-extrabold text-white mb-1">Badge Milestones</h3>
          <p className="text-xs text-slate-450 mb-6">Review your unlocked milestone awards.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profile.badges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex items-center gap-3"
              >
                <div className={`p-2.5 rounded-lg bg-gradient-to-tr ${badge.color || 'from-indigo-500 to-cyan-400'} text-white shadow-md`}>
                  <FiAward className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-[11px] font-bold text-white truncate">{badge.name}</h4>
                  <p className="text-[9px] text-slate-500 line-clamp-2">{badge.description}</p>
                </div>
              </div>
            ))}
            {profile.badges.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-slate-550">
                Unlock achievements to display badges.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
