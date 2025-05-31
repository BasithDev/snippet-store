import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmationBanner = ({ isVisible, message, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 flex justify-center"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-lg rounded-b-lg p-4 m-0 flex items-center justify-between max-w-3xl w-full">
            <div className="flex items-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full mr-3">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <span className="text-[var(--text-primary)]">{message}</span>
            </div>
            <div className="flex space-x-2">
              <motion.button
                className="px-3 py-1 text-sm border border-[var(--border-color)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors duration-150"
                onClick={onCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-150"
                onClick={onConfirm}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Confirm
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationBanner;
