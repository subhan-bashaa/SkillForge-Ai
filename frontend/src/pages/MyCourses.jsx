import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api';
import {
  FiBookOpen,
  FiSearch,
  FiSliders,
  FiPlay,
  FiTrash2,
  FiCopy,
  FiEdit3,
  FiLoader,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Rename modal state
  const [editingCourse, setEditingCourse] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/course', {
        params: { search, level, sort, page, per_page: 6 }
      });
      setCourses(response.data.courses);
      setTotalPages(response.data.pages);
      setErrorMsg('');
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to load courses. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, level, sort, page]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this roadmap?')) return;
    try {
      await api.delete(`/api/course/${id}`);
      fetchCourses();
    } catch (error) {
      alert('Delete failed.');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/api/course/${id}/duplicate`);
      fetchCourses();
    } catch (error) {
      alert('Duplication failed.');
    }
  };

  const startRename = (course) => {
    setEditingCourse(course);
    setNewTitle(course.title);
  };

  const saveRename = async () => {
    if (!newTitle.trim()) return;
    try {
      await api.put(`/api/course/${editingCourse.id}`, { title: newTitle });
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      alert('Rename failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-sans">
      <Sidebar />

      <main className="flex-grow p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">My Learning Roadmaps</h1>
            <p className="text-slate-400 text-sm mt-1">Manage and track your customized AI-engineered training programs.</p>
          </div>
          <button
            onClick={() => navigate('/create-course')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            Create New Course
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search syllabus..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FiSliders /> Filters
            </div>

            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="progress">Highest Progress</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Course Grid */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <FiLoader className="w-8 h-8 animate-spin text-indigo-400" />
            <span className="text-sm font-medium uppercase tracking-widest">Loading courses...</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-slate-900/20 border border-dashed border-slate-800/80 rounded-2xl p-12 text-center max-w-md mx-auto">
            <FiBookOpen className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <h3 className="font-bold text-white mb-1">No roadmaps generated yet</h3>
            <p className="text-xs text-slate-500 mb-6">Launch the AI Generator to outline and forge your study paths.</p>
            <button
              onClick={() => navigate('/create-course')}
              className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progressPct = course.completion_rate || 0;
              return (
                <div
                  key={course.id}
                  className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                        course.level === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        course.level === 'Advanced' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {course.level}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startRename(course)}
                          title="Rename"
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <FiEdit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(course.id)}
                          title="Duplicate"
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <FiCopy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          title="Delete"
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-white text-base leading-snug line-clamp-2 min-h-[3rem]">
                      {course.title}
                    </h3>
                    
                    <p className="text-[11px] text-slate-450 mt-1 uppercase font-bold tracking-wider">
                      Target Role: {course.target_role || 'Developer'}
                    </p>
                  </div>

                  <div className="mt-8 space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Progress</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full bg-slate-950 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/20 text-slate-200 hover:text-indigo-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FiPlay /> Continue Learning
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FiChevronLeft />
            </button>
            <span className="text-xs text-slate-450 font-bold">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FiChevronRight />
            </button>
          </div>
        )}

        {/* Rename Modal */}
        {editingCourse && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
              <h3 className="font-extrabold text-white text-base">Rename Roadmap</h3>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new roadmap title"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRename}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
