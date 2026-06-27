import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api';
import {
  FiAward,
  FiClock,
  FiPlay,
  FiChevronRight,
  FiRefreshCw,
  FiDownload,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
  FiInfo
} from 'react-icons/fi';

export default function AIQuizGenerator() {
  const navigate = useNavigate();
  // Course selection
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');

  // Quiz execution states
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 secs)
  const [timerInterval, setTimerInterval] = useState(null);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/course');
      setCourses(res.data.courses);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/api/quiz/leaderboard');
      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchLeaderboard();
  }, []);

  // Update lessons when course changes
  useEffect(() => {
    if (!selectedCourseId) {
      setLessons([]);
      setSelectedLessonId('');
      return;
    }
    const course = courses.find(c => c.id === parseInt(selectedCourseId));
    if (course) {
      const flat = [];
      course.modules.forEach(m => {
        m.lessons.forEach(l => {
          flat.push(l);
        });
      });
      setLessons(flat);
      if (flat.length > 0) {
        setSelectedLessonId(flat[0].id.toString());
      }
    }
  }, [selectedCourseId, courses]);

  // Timer runner
  useEffect(() => {
    if (quiz && !quizResult && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0 && quiz && !quizResult) {
      handleSubmitQuiz();
    }
  }, [quiz, quizResult, timeLeft]);

  const handleStartQuiz = async () => {
    if (!selectedLessonId) {
      alert('Please select a lesson first.');
      return;
    }
    setLoadingQuiz(true);
    setQuizResult(null);
    setAnswers({});
    setTimeLeft(180); // 3 minutes for 3 questions
    try {
      const res = await api.get('/api/quiz/generate', {
        params: { lesson_id: selectedLessonId, course_id: selectedCourseId }
      });
      setQuiz(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate quiz. Check server logs.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectAnswer = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/quiz/submit', {
        quiz_id: quiz.id,
        answers: answers
      });
      setQuizResult(res.data);
      fetchLeaderboard();
    } catch (err) {
      alert('Submit failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadResult = () => {
    if (!quizResult) return;
    let report = `====================================\n`;
    report += `SKILLFORGE AI - QUIZ REPORT CARD\n`;
    report += `====================================\n`;
    report += `Quiz Title: ${quiz?.title ?? 'Quiz'}\n`;
    report += `Date Attempted: ${new Date().toLocaleDateString()}\n`;
    report += `Final Score: ${quizResult.score}%\n`;
    report += `Questions Correct: ${quizResult.correct_count}/${quizResult.total_questions}\n`;
    report += `XP Points Awarded: +${quizResult.xp_gained} XP\n\n`;
    report += `Detailed Review:\n`;
    
    (quizResult.questions || []).forEach((q, idx) => {
      const userAns = answers[q?.id?.toString()] || 'Unanswered';
      report += `${idx + 1}. Question: ${q?.question ?? 'N/A'}\n`;
      report += `   Your Answer: ${userAns}\n`;
      report += `   Correct Answer: ${q?.correct_answer ?? 'N/A'}\n`;
      report += `   Explanation: ${q?.explanation ?? 'N/A'}\n\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SkillForge-QuizResult-${quiz.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-sans">
      <Sidebar />

      <main className="flex-grow p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 w-full flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Selector Form and Quiz Play Board */}
        <div className="flex-grow space-y-6 lg:max-w-[70%] w-full">
          <div>
            <h1 className="text-3xl font-black text-white">AI Quiz Generator</h1>
            <p className="text-slate-400 text-sm mt-1">Generate diagnostic tests based on your completed lessons to gauge syllabus memory retention.</p>
          </div>

          {/* Form Selector */}
          {!quiz && (
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
              <h3 className="font-extrabold text-white text-base">Select Lesson Context</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Course Roadmap</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-350 focus:outline-none cursor-pointer focus:border-indigo-500"
                  >
                    <option value="">Choose Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lesson Module</label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    disabled={!selectedCourseId}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-355 focus:outline-none cursor-pointer focus:border-indigo-500 disabled:opacity-40"
                  >
                    <option value="">Select Lesson</option>
                    {lessons.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                disabled={loadingQuiz || !selectedLessonId}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {loadingQuiz ? <FiLoader className="animate-spin" /> : <FiPlay />}
                <span>{loadingQuiz ? 'Generating Quiz Questions...' : 'Generate and Start Quiz'}</span>
              </button>
            </div>
          )}

          {/* ACTIVE QUIZ PLAYING BOARD */}
          {quiz && !quizResult && (
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-850 pb-4">
                <h3 className="font-extrabold text-white text-base truncate max-w-sm">{quiz.title}</h3>
                <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
                  <FiClock /> {formatTimer(timeLeft)}
                </div>
              </div>

              <div className="space-y-6">
                {(!quiz?.questions || !Array.isArray(quiz?.questions)) ? (
                  <div className="text-center p-6 text-rose-400 font-bold">
                    Invalid AI response. Please regenerate.
                  </div>
                ) : quiz.questions.map((q, qIdx) => (
                  <div key={q?.id ?? qIdx} className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850/50">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">Question {qIdx + 1} of {quiz.questions.length} • {(q?.type ?? 'mcq').replace('_', ' ').toUpperCase()}</span>
                    <h4 className="font-bold text-white text-sm leading-relaxed">{q?.question ?? 'Invalid question text'}</h4>
                    
                    {/* Render Choices based on question type */}
                    {(!q?.type || q.type === 'mcq' || q.type === 'true_false') ? (
                      <div className="grid grid-cols-1 gap-2 pt-2">
                        {(q?.options || []).map((option, oIdx) => {
                          const isSelected = answers[q?.id?.toString()] === option;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectAnswer(q?.id?.toString(), option)}
                              className={`w-full text-left px-4 py-3 border text-xs font-semibold rounded-xl cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                                  : 'bg-slate-900/20 border-slate-850 text-slate-400 hover:text-white hover:bg-slate-800/40'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      // Fill in the blanks textbox input
                      <div className="pt-2">
                        <input
                          type="text"
                          value={answers[q?.id?.toString()] || ''}
                          onChange={(e) => handleSelectAnswer(q?.id?.toString(), e.target.value)}
                          placeholder="Type answer here..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setQuiz(null)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Exit
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  {submitting ? 'Submitting Responses...' : 'Submit Answers'}
                </button>
              </div>
            </div>
          )}

          {/* SCORE CARD REPORT */}
          {quizResult && (
            <div className="space-y-6">
              
              {/* Scorecard banner */}
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded tracking-widest">Attempt Finished</span>
                  <h3 className="text-2xl font-black text-white pt-1">{quiz.title}</h3>
                  <div className="text-xs text-slate-450 font-semibold flex items-center gap-3 justify-center sm:justify-start">
                    <span>Correct: <strong className="text-white">{quizResult.correct_count}/{quizResult.total_questions}</strong></span>
                    <span>•</span>
                    <span>Score: <strong className="text-cyan-400">{quizResult.score}%</strong></span>
                  </div>
                </div>
                
                <div className="bg-slate-950/60 border border-slate-850 px-5 py-3 rounded-2xl text-center flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">XP gained</span>
                  <span className="text-2xl font-black text-indigo-400">+{quizResult.xp_gained} XP</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDownloadResult}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FiDownload /> Download Result
                </button>
                <button
                  onClick={handleStartQuiz}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FiRefreshCw /> Retry Quiz
                </button>
                <button
                  onClick={() => {
                    setQuiz(null);
                    setQuizResult(null);
                    navigate('/dashboard');
                  }}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Return to Dashboard
                </button>
              </div>

              {/* Graded Questions Explanations Review */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syllabus Explanations Review</h4>
                {(quizResult.questions || []).map((q, idx) => {
                  const userAns = answers[q?.id?.toString()] || 'Unanswered';
                  const isCorrect = userAns.trim().toLowerCase() === (q?.correct_answer ?? '').trim().toLowerCase();
                  return (
                    <div key={q?.id ?? idx} className="bg-slate-905/30 border border-slate-850 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-white text-sm leading-relaxed">{idx + 1}. {q?.question ?? 'N/A'}</h4>
                        {isCorrect ? (
                          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0"><FiCheckCircle /> Correct</span>
                        ) : (
                          <span className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0"><FiXCircle /> Incorrect</span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold pt-1">
                        <div className="p-3 bg-slate-950 border border-slate-850/50 rounded-xl">
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Your response</span>
                          <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{userAns}</span>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-850/50 rounded-xl">
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Correct answer</span>
                          <span className="text-indigo-400">{q?.correct_answer ?? 'N/A'}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/40 border border-slate-850/30 rounded-xl flex gap-2 text-xs text-slate-400">
                        <FiInfo className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-300 font-bold">Explanation: </strong>
                          {q?.explanation ?? 'N/A'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Recruiter Leaderboard */}
        <aside className="w-full lg:w-80 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex-shrink-0 h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <FiAward className="text-indigo-400 w-5 h-5 animate-pulse" />
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Top Students</h3>
          </div>
          
          <div className="space-y-3">
            {leaderboard.map((user) => {
              const isUser = user.name.includes('(You)');
              return (
                <div
                  key={user.rank}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isUser
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400'
                      : 'bg-slate-950/40 border-slate-850/60 text-slate-350'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs font-extrabold font-mono w-4">{user.rank}.</span>
                    <span className="text-xs font-bold truncate">{user.name}</span>
                  </div>
                  <div className="flex flex-col items-end text-[10px] font-bold">
                    <span className="text-white">{user.xp} XP</span>
                    <span className="text-slate-500">{user.streak} Days</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

      </main>
    </div>
  );
}
