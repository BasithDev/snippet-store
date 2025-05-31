import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose }) => {
  const { darkMode } = useTheme();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Logged in successfully!');
          onClose();
        } else {
          setError(result.error);
        }
      } else {
        const result = await register(formData.username, formData.email, formData.password);
        if (result.success) {
          toast.success('Account created successfully!');
          onClose();
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <AnimatePresence
      onExitComplete={() => setIsLogin(true)}
    >
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="relative w-full max-w-md p-6 mx-auto rounded-lg shadow-lg overflow-hidden modal-content"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ 
              scale: 1, 
              y: 0, 
              opacity: 1,
              height: "auto"
            }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              height: { duration: 0.3, ease: "easeInOut" }
            }}
            layout
          >
        
        <button 
          onClick={() => {
            onClose();
            setIsLogin(true);
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <motion.div 
          className="mb-6 text-center"
          layout
        >
          <h2 className="text-2xl font-bold">
            {isLogin ? 'Login' : 'Sign Up'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? 'Sign in to access your snippets' 
              : 'Create an account to save and share snippets'}
          </p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit}
          className="overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          layout
        >
          {error && (
            <motion.div 
              className="mb-4 p-2 text-sm text-red-600 bg-red-100 rounded-md"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}
          <motion.div
            key={isLogin ? "login" : "signup"}
            initial={{ x: isLogin ? -20 : 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLogin ? 20 : -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {!isLogin && (
            <div className="mb-4">
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-400">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-400">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-400">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              required
            />
          </div>

            {!isLogin && (
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-400">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              />
            </div>
            )}
          </motion.div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 mt-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 primary-button ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Logging in...' : 'Signing up...'}
              </span>
            ) : (
              <>{isLogin ? 'Login' : 'Sign Up'}</>
            )}
          </button>
        </motion.form>

        <motion.div 
          className="mt-6 text-center"
          layout
        >
          <p className="text-sm text-gray-600">
            {isLogin 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <motion.button
              onClick={toggleAuthMode}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className="font-medium hover:underline focus:outline-none"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </motion.button>
          </p>
        </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;