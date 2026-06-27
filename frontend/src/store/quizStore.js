import { create } from 'zustand';
import api from '../api';

const useQuizStore = create((set, get) => ({
  cache: {}, // Stores quiz data by lesson_id
  loading: false,
  error: null,

  fetchQuiz: async (lessonId) => {
    const state = get();
    // Return immediately if cached
    if (state.cache[lessonId]) {
      return state.cache[lessonId];
    }

    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/quiz/generate?lesson_id=${lessonId}`);
      const quizData = response.data;
      
      set((prev) => ({
        cache: {
          ...prev.cache,
          [lessonId]: quizData,
        },
        loading: false,
      }));
      return quizData;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Failed to generate quiz', 
        loading: false 
      });
      return null;
    }
  },

  retakeQuiz: async (lessonId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/quiz/generate?lesson_id=${lessonId}`);
      const quizData = response.data;
      
      set((prev) => ({
        cache: {
          ...prev.cache,
          [lessonId]: quizData, // Overwrite existing cache
        },
        loading: false,
      }));
      return quizData;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Failed to regenerate quiz', 
        loading: false 
      });
      return null;
    }
  },

  clearCache: () => set({ cache: {} }),
  clearError: () => set({ error: null })
}));

export default useQuizStore;
