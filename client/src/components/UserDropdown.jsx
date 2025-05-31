import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const UserDropdown = ({ showDropdown, handleLogout, user }) => {
  if (!user) return null;
  return (
    <AnimatePresence>
      {showDropdown && (
        <motion.div 
          className="absolute right-0 mt-2 w-56 bg-[var(--bg-primary)] rounded-lg shadow-xl border border-[var(--border-color)] overflow-hidden z-20"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ backdropFilter: 'blur(8px)' }}>
        <motion.div 
          className="p-4 border-b border-[var(--border-color)] flex items-center space-x-3"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <motion.div 
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg shadow-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
            style={{color:"white"}}
          >
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </motion.div>
          <div>
            <p className="font-medium text-[var(--text-primary)]">{user.username}</p>
            <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
          </div>
        </motion.div>
        
        <div className="py-1">
          <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 500 }}>
            <Link to="/my-snippets" className="flex items-center px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              My Snippets
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 500 }}>
            <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Settings
            </Link>
          </motion.div>
        </div>
        
        <div className="border-t border-[var(--border-color)] py-1">
          <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 500 }}>
            <button 
              onClick={handleLogout}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-150"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </motion.div>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserDropdown;
