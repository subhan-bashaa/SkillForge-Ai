import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  FiSettings,
  FiLock,
  FiBell,
  FiGlobe,
  FiDownload,
  FiTrash2,
  FiLoader
} from 'react-icons/fi';

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Settings Options state
  const [themeSetting, setThemeSetting] = useState('dark');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [language, setLanguage] = useState('English');

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    setChangingPass(true);
    try {
      await api.post('/api/profile/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      alert('Password updated successfully.');
      setCurrentPassword('');
      newPassword('');
      confirmPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Password update failed.');
    } finally {
      setChangingPass(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/api/profile/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "SkillForge-ExportData.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Data export failed.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('WARNING: Deleting your account will remove all saved roadmaps, course completion logs, notes, and XP achievements permanently. This action is irreversible. Proceed?')) return;
    try {
      await api.delete('/api/profile/account');
      alert('Account deleted successfully.');
      logout();
      navigate('/');
    } catch (err) {
      alert('Account deletion failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-sans">
      <Sidebar />

      <main className="flex-grow p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-8 w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white">System Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Configure language parameters, manage email notifications, update passwords, and manage personal data export/deletion.</p>
        </div>

        {/* Configurations Forms Grid */}
        <div className="space-y-6">
          
          {/* General Preferences */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-6">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 pb-3 border-b border-slate-850">
              <FiSettings className="text-indigo-400" /> Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Language selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <FiGlobe className="text-cyan-400" /> Interface Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-350 focus:outline-none cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Hindi">Hindi</option>
                  <option value="German">German</option>
                  <option value="Mandarin">Mandarin</option>
                </select>
              </div>

              {/* Theme selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  Appearance Mode
                </label>
                <select
                  value={themeSetting}
                  onChange={(e) => setThemeSetting(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-350 focus:outline-none cursor-pointer"
                >
                  <option value="dark">Vibrant Dark Mode</option>
                  <option value="light">Classic Light Mode</option>
                  <option value="system">System Default</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email & Reminder Notifications */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-6">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 pb-3 border-b border-slate-850">
              <FiBell className="text-indigo-400" /> Notifications Configuration
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 text-xs text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 bg-slate-950 border border-slate-800 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span>Receive weekly progress analytics summary emails</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminders}
                  onChange={(e) => setReminders(e.target.checked)}
                  className="w-4 h-4 bg-slate-950 border border-slate-800 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span>Daily study streak push notification reminders</span>
              </label>
            </div>
          </div>

          {/* Change Password form */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-6">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 pb-3 border-b border-slate-850">
              <FiLock className="text-indigo-400" /> Security Settings
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={changingPass}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
              >
                {changingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Account Data Exports & Deletion */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-6">
            <h3 className="font-extrabold text-rose-500 text-base flex items-center gap-2 pb-3 border-b border-slate-850">
              Danger Zone
            </h3>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-white leading-normal">Export Workspace Portfolio Data</h4>
                <p className="text-[10px] text-slate-500">Download a complete structured JSON representation of your profile, analytics logs, and roadmaps.</p>
              </div>
              <button
                onClick={handleExportData}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FiDownload /> Export Portfolio
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-rose-455 leading-normal">Delete SkillForge Account</h4>
                <p className="text-[10px] text-slate-500">Permanently terminate your credentials, course histories, certificates, and XP progress.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FiTrash2 /> Delete Account
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
