import { useState, useEffect } from 'react';
import { 
  FiCheckCircle, FiXCircle, FiInfo, FiRefreshCw, 
  FiPlay, FiChevronLeft, FiChevronRight, FiCheck 
} from 'react-icons/fi';
import useQuizStore from '../store/quizStore';
import api from '../api';

export default function LessonQuiz({ lessonId }) {
  const { cache, loading, error, fetchQuiz, retakeQuiz } = useQuizStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewingReview, setViewingReview] = useState(false);

  const quiz = cache[lessonId];

  // Reset state when lessonId changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizResult(null);
    setViewingReview(false);
  }, [lessonId]);

  const handleStartQuiz = async () => {
    setQuizResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setViewingReview(false);
    await fetchQuiz(lessonId);
  };

  const handleRetakeQuiz = async () => {
    setQuizResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setViewingReview(false);
    await retakeQuiz(lessonId);
  };

  const handleSelectAnswer = (option) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    
    const questions = quiz?.questions || [];
    let correctCount = 0;
    
    questions.forEach((q, idx) => {
      const userAns = answers[idx];
      if (userAns && userAns.trim().toLowerCase() === (q?.correct_answer ?? '').trim().toLowerCase()) {
        correctCount += 1;
      }
    });

    const total = questions.length;
    const percentage = total > 0 ? (correctCount / total) * 100 : 0;
    const wrongAnswers = total - correctCount;

    try {
      const res = await api.post('/api/quiz/submit', {
        lesson_id: lessonId,
        score: percentage,
        percentage: percentage,
        correct_answers: correctCount,
        wrong_answers: wrongAnswers
      });
      
      setQuizResult({
        percentage: Math.round(percentage),
        correctCount,
        wrongAnswers,
        total,
        xp_gained: res.data.xp_gained
      });
    } catch (err) {
      alert('Submit failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz && !loading) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-indigo-500/10 rounded-full mb-2">
          <FiCheckCircle className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-extrabold text-white text-lg">Ready to test your knowledge?</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Take a quick AI-generated quiz to solidify what you just learned.</p>
        </div>
        <button
          onClick={handleStartQuiz}
          className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <FiPlay /> Start AI Quiz
        </button>
        {error && <p className="text-rose-400 text-xs font-semibold">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 p-12 rounded-2xl flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-semibold animate-pulse">Generating your custom quiz...</p>
      </div>
    );
  }

  if (quizResult && !viewingReview) {
    // Determine performance level
    let level = "Needs Practice";
    let levelColor = "text-rose-400";
    let levelBg = "bg-rose-500/10 border-rose-500/20";
    if (quizResult.percentage >= 90) {
      level = "Excellent";
      levelColor = "text-emerald-400";
      levelBg = "bg-emerald-500/10 border-emerald-500/20";
    } else if (quizResult.percentage >= 75) {
      level = "Great Job";
      levelColor = "text-indigo-400";
      levelBg = "bg-indigo-500/10 border-indigo-500/20";
    } else if (quizResult.percentage >= 50) {
      level = "Good";
      levelColor = "text-amber-400";
      levelBg = "bg-amber-500/10 border-amber-500/20";
    }

    return (
      <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className={`inline-block px-4 py-1.5 rounded-full border text-sm font-extrabold tracking-widest uppercase ${levelBg} ${levelColor}`}>
            {level}
          </div>
          <h2 className="text-4xl font-black text-white">{quizResult.percentage}% Score</h2>
          <p className="text-slate-400 font-semibold text-sm">
            You got {quizResult.correctCount} out of {quizResult.total} correct.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/50">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">XP Gained</span>
            <span className="text-lg font-black text-indigo-400">+{quizResult.xp_gained}</span>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Correct</span>
            <span className="text-lg font-black text-emerald-400">{quizResult.correctCount}</span>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Wrong</span>
            <span className="text-lg font-black text-rose-400">{quizResult.wrongAnswers}</span>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Total</span>
            <span className="text-lg font-black text-slate-300">{quizResult.total}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
          <button
            onClick={() => setViewingReview(true)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl cursor-pointer transition-colors"
          >
            Review Answers
          </button>
          <button
            onClick={handleRetakeQuiz}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <FiRefreshCw /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  if (viewingReview) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
          <h3 className="font-extrabold text-white">Quiz Review</h3>
          <button
            onClick={() => setViewingReview(false)}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            Back to Score
          </button>
        </div>
        
        {(!quiz?.questions || !Array.isArray(quiz?.questions)) ? (
          <div className="bg-slate-905/30 border border-slate-850 p-6 rounded-2xl space-y-4 text-center text-rose-400 font-bold">
            Invalid AI response. Please regenerate.
          </div>
        ) : quiz.questions.map((q, idx) => {
          const userAns = answers[idx] || 'Unanswered';
          const isCorrect = userAns.trim().toLowerCase() === (q?.correct_answer ?? '').trim().toLowerCase();
          
          return (
            <div key={idx} className="bg-slate-905/30 border border-slate-850 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h4 className="font-bold text-white text-sm leading-relaxed">
                  <span className="text-slate-500 mr-2">{idx + 1}.</span>
                  {q?.question ?? 'N/A'}
                </h4>
                {isCorrect ? (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1 shrink-0 uppercase tracking-widest"><FiCheckCircle /> Correct</span>
                ) : (
                  <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded flex items-center gap-1 shrink-0 uppercase tracking-widest"><FiXCircle /> Incorrect</span>
                )}
              </div>

              <div className="space-y-2">
                {(q?.options || []).map((opt, oIdx) => {
                  const isUserSelected = answers[idx] === opt;
                  const isActuallyCorrect = opt.trim().toLowerCase() === (q?.correct_answer ?? '').trim().toLowerCase();
                  
                  let optStyle = "bg-slate-950/40 border-slate-850/50 text-slate-400";
                  let icon = null;
                  
                  if (isActuallyCorrect) {
                    optStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold";
                    icon = <FiCheckCircle className="shrink-0" />;
                  } else if (isUserSelected && !isActuallyCorrect) {
                    optStyle = "bg-rose-500/10 border-rose-500/40 text-rose-400 font-bold";
                    icon = <FiXCircle className="shrink-0" />;
                  }

                  return (
                    <div key={oIdx} className={`px-4 py-3 border rounded-xl flex justify-between items-center text-xs ${optStyle}`}>
                      <span>{opt}</span>
                      {icon}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex gap-3 text-xs text-slate-300 mt-4">
                <FiInfo className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Explanation</strong>
                  {q?.explanation ?? 'N/A'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Active Quiz View
  if (!quiz?.questions || !Array.isArray(quiz?.questions)) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-rose-500/10 rounded-full mb-2">
          <FiXCircle className="w-8 h-8 text-rose-400" />
        </div>
        <div>
          <h3 className="font-extrabold text-white text-lg">Invalid AI Response</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">The AI failed to generate valid quiz questions. Please retry.</p>
        </div>
        <button
          onClick={handleRetakeQuiz}
          className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <FiRefreshCw /> Retry Quiz
        </button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 p-6 md:p-8 rounded-2xl space-y-8">
      {/* Header and Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="space-y-6">
        <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
          {currentQ?.question ?? 'Invalid question text'}
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {(currentQ?.options || []).map((option, idx) => {
            const isSelected = answers[currentQuestionIndex] === option;
            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(option)}
                className={`w-full text-left px-5 py-4 border rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <span>{option}</span>
                {isSelected && <FiCheck className="w-5 h-5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <FiChevronLeft /> Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting || !answers[currentQuestionIndex]}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Finish Quiz'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            disabled={!answers[currentQuestionIndex]}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20 transition-colors"
          >
            Next <FiChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}
