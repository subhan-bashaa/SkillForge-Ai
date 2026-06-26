import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api';
import {
  FiBookOpen,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiArrowLeft,
  FiVideo,
  FiBookmark,
  FiFileText,
  FiLink,
  FiArrowRight,
  FiMessageSquare,
  FiAward,
  FiList,
  FiCheckSquare,
  FiLayers,
  FiCpu,
  FiHelpCircle
} from 'react-icons/fi';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Active elements state
  const [activeLesson, setActiveLesson] = useState(null);
  const [openModules, setOpenModules] = useState({});
  const [activeTab, setActiveTab] = useState('notes'); // notes, video, resources, selfNote, syllabus, projects, interview

  // Note/Bookmark state
  const [selfNote, setSelfNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);

  const fetchCourseDetails = async () => {
    try {
      // Queried singular /api/course path
      const response = await api.get(`/api/course/${id}`);
      setCourse(response.data);
      
      let firstLesson = null;
      let firstIncomplete = null;
      const initialOpenModules = {};
      
      response.data.modules.forEach((mod) => {
        initialOpenModules[mod.id] = true;
        mod.lessons.forEach((les) => {
          if (!firstLesson) firstLesson = les;
          if (!les.completed && !firstIncomplete) firstIncomplete = les;
        });
      });
      
      setOpenModules(initialOpenModules);
      const selected = firstIncomplete || firstLesson;
      setActiveLesson(selected);
      setErrorMsg('');
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to load course details. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  useEffect(() => {
    if (!activeLesson) return;

    const fetchLessonExtras = async () => {
      try {
        const noteRes = await api.get(`/api/bookmarks/notes/${activeLesson.id}`);
        setSelfNote(noteRes.data.content || '');

        const bookmarkRes = await api.get('/api/bookmarks');
        const found = bookmarkRes.data.find((b) => b.lesson_id === activeLesson.id);
        if (found) {
          setIsBookmarked(true);
          setBookmarkId(found.id);
        } else {
          setIsBookmarked(false);
          setBookmarkId(null);
        }
      } catch (error) {
        console.error('Error loading lesson extras:', error);
      }
    };

    fetchLessonExtras();
  }, [activeLesson]);

  const toggleModule = (modId) => {
    setOpenModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleToggleCompletion = async () => {
    if (!activeLesson) return;
    try {
      const currentStatus = activeLesson.completed;
      // Updated singular API request endpoint path
      const res = await api.patch(`/api/course/lessons/${activeLesson.id}/complete`, {
        completed: !currentStatus
      });
      
      setActiveLesson(prev => ({ ...prev, completed: res.data.completed }));
      fetchCourseDetails();
    } catch (error) {
      alert('Error updating completion state.');
    }
  };

  const handleSaveSelfNote = async () => {
    if (!activeLesson) return;
    setSavingNote(true);
    try {
      await api.post('/api/bookmarks/notes', {
        lesson_id: activeLesson.id,
        content: selfNote
      });
      alert('Notes saved successfully.');
    } catch (error) {
      alert('Note saving failed.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!activeLesson) return;
    try {
      if (isBookmarked) {
        await api.delete(`/api/bookmarks/${bookmarkId}`);
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        const res = await api.post('/api/bookmarks', {
          lesson_id: activeLesson.id,
          title: activeLesson.title
        });
        setIsBookmarked(true);
        setBookmarkId(res.data.id);
      }
    } catch (error) {
      alert('Bookmark operation failed.');
    }
  };

  const getFlatLessons = () => {
    if (!course) return [];
    const list = [];
    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        list.push(l);
      });
    });
    return list;
  };

  const handleNext = () => {
    const flat = getFlatLessons();
    const idx = flat.findIndex(l => l.id === activeLesson.id);
    if (idx !== -1 && idx < flat.length - 1) {
      setActiveLesson(flat[idx + 1]);
    }
  };

  const handlePrev = () => {
    const flat = getFlatLessons();
    const idx = flat.findIndex(l => l.id === activeLesson.id);
    if (idx !== -1 && idx > 0) {
      setActiveLesson(flat[idx - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3 font-sans">
        <FiLoader className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm font-semibold uppercase tracking-wider">Compiling Course Board...</span>
      </div>
    );
  }

  if (errorMsg || !course) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4 font-sans p-6">
        <FiAlertCircle className="w-12 h-12 text-rose-500" />
        <h3 className="text-xl font-bold text-white">Error Loading Details</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">{errorMsg}</p>
        <button
          onClick={() => navigate('/courses')}
          className="bg-indigo-600 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const progressPct = course.completion_rate || 0;
  const flatLessons = getFlatLessons();
  const currentIdx = flatLessons.findIndex(l => l.id === activeLesson?.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-sans">
      <Sidebar />

      {/* Main split screen layout */}
      <div className="flex-grow flex flex-col lg:flex-row w-full h-[100vh] overflow-hidden">
        
        {/* LEFT COLUMN: Modules Accordion List */}
        <aside className="w-full lg:w-80 bg-slate-900/30 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-5 flex flex-col overflow-y-auto flex-shrink-0">
          <div className="space-y-4 mb-6">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <FiArrowLeft /> Back to Courses
            </button>
            <h2 className="font-extrabold text-white text-lg leading-snug line-clamp-2">{course.title}</h2>
            
            {/* Dynamic Progress indicator */}
            <div className="space-y-2 bg-slate-950/40 border border-slate-850 p-3 rounded-xl">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Completed</span>
                <span>{course.completed_lessons}/{course.total_lessons} ({progressPct}%)</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex-grow space-y-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Syllabus Outline</h4>
            
            {course.modules.map((mod) => {
              const isModuleOpen = openModules[mod.id];
              return (
                <div key={mod.id} className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950/20">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full px-4 py-3 bg-slate-900/20 flex items-center justify-between text-xs font-extrabold text-slate-200 border-b border-slate-850/40 hover:bg-slate-900/40 cursor-pointer"
                  >
                    <span className="truncate pr-2">{mod.title}</span>
                    {isModuleOpen ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  
                  {isModuleOpen && (
                    <div className="p-2 space-y-1 bg-slate-950/40">
                      {mod.lessons.map((les) => {
                        const isCurrent = activeLesson?.id === les.id;
                        return (
                          <button
                            key={les.id}
                            onClick={() => setActiveLesson(les)}
                            className={`w-full flex items-start gap-2.5 px-3 py-2 text-left text-xs rounded-lg transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
                            }`}
                          >
                            <FiCheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${les.completed ? 'text-indigo-400 fill-indigo-500/10' : 'text-slate-650'}`} />
                            <span className="line-clamp-2 leading-normal">{les.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT COLUMN: Active Lesson Viewer */}
        <section className="flex-grow flex flex-col h-full bg-slate-950 overflow-y-auto p-6 sm:p-8 relative">
          
          {activeLesson ? (
            <div className="space-y-6 flex-grow flex flex-col justify-between">
              
              {/* Lesson Title & Top Actions */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded uppercase">
                      Estimated: {activeLesson.duration || '20 mins'}
                    </span>
                    <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
                      {activeLesson.difficulty || 'Intermediate'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleToggleBookmark}
                      className={`p-2 border rounded-xl transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
                    >
                      <FiBookmark />
                    </button>
                    <button
                      onClick={() => navigate('/mentor')}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FiMessageSquare /> Ask Mentor
                    </button>
                  </div>
                </div>

                <h1 className="text-2xl font-black text-white leading-snug">{activeLesson.title}</h1>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-slate-850 flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'notes' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-white'}`}
                >
                  <span className="flex items-center gap-1.5"><FiFileText /> Study Guide</span>
                </button>
                <button
                  onClick={() => setActiveTab('video')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'video' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-white'}`}
                >
                  <span className="flex items-center gap-1.5"><FiVideo /> Video Lectures</span>
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'resources' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-white'}`}
                >
                  <span className="flex items-center gap-1.5"><FiLink /> Study Materials</span>
                </button>
                <button
                  onClick={() => setActiveTab('selfNote')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'selfNote' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-white'}`}
                >
                  <span className="flex items-center gap-1.5"><FiBookmark /> Personal Journal</span>
                </button>
                <button
                  onClick={() => setActiveTab('syllabus')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'syllabus' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-white'}`}
                >
                  <span className="flex items-center gap-1.5"><FiLayers /> Milestones</span>
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'projects' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-white'}`}
                >
                  <span className="flex items-center gap-1.5"><FiCpu /> Projects</span>
                </button>
                <button
                  onClick={() => setActiveTab('interview')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'interview' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-white'}`}
                >
                  <span className="flex items-center gap-1.5"><FiHelpCircle /> Interview Prep</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-grow py-4 min-h-[30vh]">
                
                {/* Notes & Checklists */}
                {activeTab === 'notes' && (
                  <div className="space-y-6">
                    <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line bg-slate-900/30 p-5 rounded-2xl border border-slate-850/50">
                      {activeLesson.notes || "This lesson covers the logical layout of the training program. Complete practice tasks."}
                    </p>

                    {/* Practice Tasks checklists */}
                    {activeLesson.practice_tasks && activeLesson.practice_tasks.length > 0 && (
                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-3">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <FiCheckSquare className="text-indigo-400" /> Lesson Practice Tasks
                        </h4>
                        <ul className="space-y-2">
                          {activeLesson.practice_tasks.map((task, idx) => (
                            <li key={idx} className="text-xs text-slate-350 flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5"></span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quiz Topics */}
                    {activeLesson.quiz_topics && activeLesson.quiz_topics.length > 0 && (
                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-3">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <FiAward className="text-amber-500" /> Exam Topics to Prepare
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activeLesson.quiz_topics.map((topic, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-950 border border-slate-850 text-slate-400 px-3 py-1 rounded-full font-semibold">{topic}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'video' && (
                  <div className="aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 flex items-center justify-center relative">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={activeLesson.video_url || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                      title="Practice Lecture Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="space-y-6">
                    {/* Normalized Resources */}
                    {course.resources && course.resources.length > 0 && (
                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                        <h4 className="font-bold text-white text-sm mb-3">Course Syllabus Resources</h4>
                        <ul className="space-y-3">
                          {course.resources.map((res, idx) => (
                            <li key={idx} className="text-xs text-indigo-400 font-semibold flex items-center gap-2">
                              <FiLink /> <a href={res.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{res.title}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                      <h4 className="font-bold text-white text-sm mb-3">Lesson Resources</h4>
                      <ul className="space-y-3">
                        {activeLesson.resources && activeLesson.resources.length > 0 ? (
                          activeLesson.resources.map((res, idx) => (
                            <li key={idx} className="text-xs text-indigo-400 font-semibold flex items-center gap-2">
                              <FiLink /> <a href={res} target="_blank" rel="noopener noreferrer" className="hover:underline">{res}</a>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-slate-500">Official technical guides are recommended for referencing.</li>
                        )}
                      </ul>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                      <h4 className="font-bold text-white text-sm mb-3">External References</h4>
                      <ul className="space-y-3">
                        {activeLesson.external_links && activeLesson.external_links.length > 0 ? (
                          activeLesson.external_links.map((link, idx) => (
                            <li key={idx} className="text-xs text-indigo-400 font-semibold flex items-center gap-2">
                              <FiLink /> <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">{link}</a>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-slate-500">Read official repository guides and stack documentation files.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'selfNote' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-sm">Study Journal Notes</h4>
                    <p className="text-xs text-slate-550">Write summaries or draft snippet questions during study. Notes sync automatically to SQLite.</p>
                    <textarea
                      value={selfNote}
                      onChange={(e) => setSelfNote(e.target.value)}
                      placeholder="Draft notes here..."
                      rows={8}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-650 focus:outline-none transition-colors resize-none font-mono"
                    />
                    <button
                      onClick={handleSaveSelfNote}
                      disabled={savingNote}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {savingNote ? 'Saving...' : 'Save Journal Entry'}
                    </button>
                  </div>
                )}

                {/* Course Syllabus Overview (Milestones, Outcomes) */}
                {activeTab === 'syllabus' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-3">
                      <h4 className="font-bold text-white text-sm">Learning Outcomes</h4>
                      <ul className="space-y-2">
                        {course.learning_outcomes && course.learning_outcomes.map((out, idx) => (
                          <li key={idx} className="text-xs text-slate-350 flex items-start gap-2">
                            <FiCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{out}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-3">
                        <h4 className="font-bold text-white text-sm">Weekly Study Plans</h4>
                        <ul className="space-y-2">
                          {course.weekly_plan && course.weekly_plan.map((plan, idx) => (
                            <li key={idx} className="text-xs text-slate-350 flex items-start gap-2">
                              <span className="text-[10px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded font-bold text-indigo-400">WEEK {idx + 1}</span>
                              <span>{plan}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-3">
                        <h4 className="font-bold text-white text-sm">Monthly Milestones</h4>
                        <ul className="space-y-2">
                          {course.monthly_milestones && course.monthly_milestones.map((mile, idx) => (
                            <li key={idx} className="text-xs text-slate-350 flex items-start gap-2">
                              <span className="text-[10px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded font-bold text-cyan-400">GOAL</span>
                              <span>{mile}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Capstone Projects */}
                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-sm">Course Projects Portfolio</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {course.projects && course.projects.map((proj) => (
                        <div key={proj.id} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-2">
                          <h4 className="text-sm font-extrabold text-indigo-400">{proj.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.technologies && proj.technologies.map((tech, idx) => (
                              <span key={idx} className="text-[9px] bg-slate-950 border border-slate-850 text-slate-500 px-2.5 py-0.5 rounded font-mono font-bold">{tech}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {(!course.projects || course.projects.length === 0) && (
                        <p className="text-xs text-slate-500">No capstone projects generated for this track.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* HR Interview Questions Prep */}
                {activeTab === 'interview' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-sm">HR Technical Interview Preparation</h4>
                    <p className="text-xs text-slate-500">Practice questions generated by Llama 3.3 for job interviews in this domain.</p>
                    <div className="space-y-3">
                      {course.interview_questions && course.interview_questions.map((quest, idx) => (
                        <div key={idx} className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex gap-3 text-xs text-slate-300 leading-normal">
                          <FiHelpCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-white block font-bold mb-1">Question {idx + 1}</strong>
                            {quest}
                          </div>
                        </div>
                      ))}
                      {(!course.interview_questions || course.interview_questions.length === 0) && (
                        <p className="text-xs text-slate-500">No interview preparation files compiled.</p>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Control Bar: Complete checklist + Prev & Next */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex items-center justify-between gap-4 mt-6">
                <button
                  onClick={handleToggleCompletion}
                  className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeLesson.completed
                      ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent'
                  }`}
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span>{activeLesson.completed ? 'Lesson Completed ✓' : 'Mark Lesson Complete'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    disabled={currentIdx <= 0}
                    onClick={handlePrev}
                    className="px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentIdx >= flatLessons.length - 1}
                    onClick={handleNext}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                  >
                    Next <FiArrowRight />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3">
              <FiBookOpen className="w-10 h-10 text-slate-700" />
              <span className="text-sm">Select a lesson from the outline to get started.</span>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
