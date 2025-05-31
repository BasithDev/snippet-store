import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import UserDropdown from './UserDropdown';
import ConfirmationBanner from './ConfirmationBanner';
import SearchBar from './SearchBar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Header = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const dropdownRef = useRef(null);

  const LOGOUT_MESSAGE = "Are you sure you want to log out?"

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const initiateLogout = () => {
    setShowLogoutConfirmation(true);
    setShowDropdown(false);
  };
  
  const confirmLogout = () => {
    logout();
    setShowLogoutConfirmation(false);
    toast.success('Logged out successfully');
    navigate('/snippets');
  };
  
  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 shadow-sm backdrop-blur-sm bg-opacity-90">

      <div 
      onClick={()=>navigate("/snippets")}
      className="flex items-center cursor-pointer">
        <h1 className="text-xl font-bold">Snippet-Store</h1>
      </div>

      <SearchBar />

      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          )}
        </button>

        {isAuthenticated() ? (
          <div className="relative" ref={dropdownRef}>
            <motion.button 
              onClick={toggleDropdown}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-blue-700 transition-colors duration-200 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{color:"white"}}
            >
              {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
            </motion.button>
            
            <UserDropdown 
              showDropdown={showDropdown} 
              handleLogout={initiateLogout} 
              user={currentUser} 
            />
          </div>
        ) : (
          <button 
            onClick={openAuthModal}
            className="px-4 py-2 font-medium border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 secondary-button cursor-pointer"
          >
            Login
          </button>
        )}
      </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      
      <ConfirmationBanner
        isVisible={showLogoutConfirmation}
        message={LOGOUT_MESSAGE}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
};

export default Header;