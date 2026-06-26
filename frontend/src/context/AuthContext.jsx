import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize Auth from localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('jwt_token');

    if (storedUser && storedToken) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error parsing stored user data', err);
        localStorage.removeItem('user');
        localStorage.removeItem('jwt_token');
      }
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed.');
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed.');
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const value = {
    currentUser,
    isAuthenticated,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
