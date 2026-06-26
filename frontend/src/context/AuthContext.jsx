import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
      // Make active request to Flask backend
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.warn('Backend connection failed, falling back to mock auth for preview mode.', error);

      // Failsafe Mock Auth for recruiter preview when backend is not running
      if (!error.response) {
        // Simulating a successful login
        const mockUser = {
          id: 'mock-usr-123',
          name: email.split('@')[0].toUpperCase(),
          email: email,
          role: 'Pro Scholar',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        };
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenSecretData';

        localStorage.setItem('jwt_token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));

        setCurrentUser(mockUser);
        setIsAuthenticated(true);
        return { success: true, isMocked: true };
      }

      // Propagate original backend errors
      throw new Error(error.response?.data?.message || 'Login failed.');
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      return { success: true, data: response.data };
    } catch (error) {
      console.warn('Backend connection failed, falling back to mock registration for preview mode.', error);

      if (!error.response) {
        // Simulating successful registration
        return { success: true, isMocked: true };
      }

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
