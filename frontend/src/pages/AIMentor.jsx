import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api';
import {
  FiMessageSquare,
  FiPlus,
  FiSend,
  FiTrash2,
  FiBook,
  FiCpu,
  FiUser,
  FiLoader,
  FiAlertCircle
} from 'react-icons/fi';

export default function AIMentor() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // Courses dropdown context seeder
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // UI state
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Explain hydration & server actions in React 19.",
    "Give me intermediate project ideas using NumPy and Pandas.",
    "Draft a code checker for thread safety in systems programming.",
    "Help me debug a database connection deadlock exception."
  ];

  const fetchSessions = async () => {
    try {
      const res = await api.get('/api/mentor/chats');
      setSessions(res.data);
      if (res.data.length > 0 && !activeSession) {
        setActiveSession(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/course');
      setCourses(res.data.courses);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!activeSession) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/mentor/chats/${activeSession.id}/messages`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendingMsg]);

  const handleCreateSession = async (courseId = null) => {
    try {
      const res = await api.post('/api/mentor/chats', { course_id: courseId });
      setSessions(prev => [res.data, ...prev]);
      setActiveSession(res.data);
    } catch (err) {
      alert('Failed to start a new chat.');
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!confirm('Delete this chat session?')) return;
    try {
      await api.delete(`/api/mentor/chats/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeSession || sendingMsg) return;

    setInputText('');
    setSendingMsg(true);

    // Optimistically add user message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.post(`/api/mentor/chats/${activeSession.id}/message`, { message: text });
      
      // Update with database messages
      setMessages(prev => {
        // Remove temp and add actual
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, res.data.user_message, res.data.ai_message];
      });
    } catch (err) {
      console.error(err);
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          message: 'Sorry, I failed to process that request. Verify your server is online.',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setSendingMsg(false);
    }
  };

  // Simplistic Markdown & Code Renderer for recruiter review formatting
  const renderMessageContent = (msg) => {
    const text = msg.message;
    const parts = text.split(/(```[a-z]*\n[\s\S]*?\n```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        // Code Block
        const lines = part.split('\n');
        const lang = lines[0].replace('```', '') || 'javascript';
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={index} className="my-3 font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto relative">
            <div className="absolute top-2 right-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">{lang}</div>
            <pre className="mt-2 whitespace-pre-wrap">{code}</pre>
          </div>
        );
      } else {
        // Plain text with line breaks and list bullet points
        return (
          <p key={index} className="whitespace-pre-line text-slate-200 text-sm leading-relaxed">
            {part}
          </p>
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-x-hidden font-sans">
      <Sidebar />

      {/* Main split chat screen layout */}
      <div className="flex-grow flex flex-col lg:flex-row w-full h-[100vh] overflow-hidden">
        
        {/* LEFT PANEL: Chat Sessions History */}
        <aside className="w-full lg:w-72 bg-slate-900/30 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-5 flex flex-col justify-between overflow-y-auto flex-shrink-0">
          <div className="space-y-4">
            <button
              onClick={() => handleCreateSession()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/10 transition-colors"
            >
              <FiPlus /> New Chat Session
            </button>

            {/* Context Seeder dropdown */}
            <div className="space-y-1.5 p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">AI Study Context</label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  if (e.target.value) handleCreateSession(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="">General Knowledge</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Recent Chats</span>
              {loadingSessions ? (
                <div className="flex justify-center py-4"><FiLoader className="animate-spin text-indigo-400" /></div>
              ) : (
                <div className="space-y-1">
                  {sessions.map((sess) => {
                    const isActive = activeSession?.id === sess.id;
                    return (
                      <div
                        key={sess.id}
                        onClick={() => setActiveSession(sess)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-slate-900 border border-slate-800 text-indigo-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
                        }`}
                      >
                        <span className="truncate pr-2">{sess.title}</span>
                        <button
                          onClick={(e) => handleDeleteSession(e, sess.id)}
                          className="p-1 hover:text-rose-400 rounded transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL: Chat Message Exchange */}
        <section className="flex-grow flex flex-col h-full bg-slate-950 overflow-hidden relative">
          
          {/* Active dialogue list */}
          <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-6">
            {messages.map((msg) => {
              const isAI = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-4 max-w-3xl ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold flex-shrink-0 shadow-md ${
                    isAI
                      ? 'bg-gradient-to-tr from-indigo-500 to-cyan-400'
                      : 'bg-gradient-to-tr from-purple-500 to-pink-500'
                  }`}>
                    {isAI ? <FiCpu className="w-4 h-4" /> : <FiUser className="w-4 h-4" />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl border ${
                    isAI
                      ? 'bg-slate-900/40 border-slate-850 text-slate-100'
                      : 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/5'
                  }`}>
                    {renderMessageContent(msg)}
                  </div>
                </div>
              );
            })}

            {sendingMsg && (
              <div className="flex gap-4 max-w-lg mr-auto">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white flex items-center justify-center flex-shrink-0 animate-pulse shadow-md">
                  <FiCpu className="w-4 h-4" />
                </div>
                <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            {/* Empty state: show suggested prompts */}
            {messages.length === 0 && !sendingMsg && (
              <div className="max-w-xl mx-auto py-12 text-center space-y-6">
                <FiMessageSquare className="w-12 h-12 text-slate-700 mx-auto" />
                <div>
                  <h3 className="font-extrabold text-white text-base">Chat with your AI Study Mentor</h3>
                  <p className="text-xs text-slate-500 mt-1">Ask questions, debug code blocks, or requests exercises based on your roadmap.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="p-3 bg-slate-900/30 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all text-left cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom input area */}
          {activeSession ? (
            <div className="p-4 bg-slate-950 border-t border-slate-900 flex gap-3 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask mentor a study question..."
                className="flex-grow bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-650 focus:outline-none transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || sendingMsg}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer transition-colors disabled:opacity-50"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500 font-semibold">
              Select or generate a chat session first to engage in AI study.
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
