import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { LOGIN_USER, REGISTER_USER } from '../apollo/User/mutations';
import { GET_CURRENT_USER } from '../apollo/User/queries';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      const exp = decoded.exp * 1000;
      return Date.now() >= exp;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Token has expired, logging out');
        logout();
        toast.error('Your session has expired. Please log in again.');
      } else {
        try {
          setCurrentUser(JSON.parse(userData));
          
          // Set up token expiration check
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiresAt = payload.exp * 1000; // Convert to milliseconds
          const timeUntilExpiry = expiresAt - Date.now();
          
          // Set a timer to log out when token expires
          if (timeUntilExpiry > 0) {
            const expiryTimer = setTimeout(() => {
              logout();
              toast.error('Your session has expired. Please log in again.');
            }, timeUntilExpiry);
            
            // Clear the timer on component unmount
            return () => clearTimeout(expiryTimer);
          }
        } catch (error) {
          console.error('Error parsing user data from localStorage', error);
          logout();
        }
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await client.mutate({
        mutation: LOGIN_USER,
        variables: { 
          input: { email, password } 
        }
      });
      
      const { token, user } = data.loginUser;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        const timeUntilExpiry = expiresAt - Date.now();
        
        if (timeUntilExpiry > 0) {
          setTimeout(() => {
            logout();
            toast.error('Your session has expired. Please log in again.');
          }, timeUntilExpiry);
        }
      } catch (error) {
        console.error('Error setting up token expiration:', error);
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during login' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await client.mutate({
        mutation: REGISTER_USER,
        variables: { 
          input: { username, email, password } 
        }
      });
      
      const { token, user } = data.registerUser;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log(user)
      
      setCurrentUser(user);
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        const timeUntilExpiry = expiresAt - Date.now();
        
        if (timeUntilExpiry > 0) {
          setTimeout(() => {
            logout();
            toast.error('Your session has expired. Please log in again.');
          }, timeUntilExpiry);
        }
      } catch (error) {
        console.error('Error setting up token expiration:', error);
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during registration' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setCurrentUser(null);
    
    client.resetStore();
  };

  const isAuthenticated = () => {
    return !!currentUser;
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
