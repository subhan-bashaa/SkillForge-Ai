import { create } from 'zustand';
import api from '../api';

const useLessonStore = create((set, get) => ({
  cache: {}, // Stores lesson data by lesson_id
  loading: false,
  error: null,

  fetchLessonContent: async (lessonId) => {
    const state = get();
    // Return immediately if cached
    if (state.cache[lessonId]) {
      return state.cache[lessonId];
    }

    // Otherwise, fetch from backend
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/lesson/${lessonId}/content`);
      const generatedContent = response.data;
      
      set((prev) => ({
        cache: {
          ...prev.cache,
          [lessonId]: generatedContent,
        },
        loading: false,
      }));
      return generatedContent;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Failed to generate lesson content', 
        loading: false 
      });
      return null;
    }
  },

  regenerateLessonContent: async (lessonId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/lesson/${lessonId}/content`);
      const generatedContent = response.data;
      
      set((prev) => ({
        cache: {
          ...prev.cache,
          [lessonId]: generatedContent, // Overwrite the existing cache entry
        },
        loading: false,
      }));
      return generatedContent;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Failed to regenerate lesson content', 
        loading: false 
      });
      return null;
    }
  },

  clearError: () => set({ error: null })
}));

export default useLessonStore;
