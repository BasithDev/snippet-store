import React from 'react';
import { formatDistanceToNow, isValid } from 'date-fns';
import { getLanguageIcon } from './LanguageIcon';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const SnippetGrid = ({ snippets, onSnippetClick, newItemsStartIndex }) => {
  const { currentUser } = useAuth();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {snippets.map((snippet, index) => (
        <motion.div
          key={snippet.id}
          variants={itemVariants}
          initial={index >= (newItemsStartIndex || snippets.length) ? "hidden" : "visible"}
          animate={index >= (newItemsStartIndex || snippets.length) ? "visible" : "visible"}
        >
        <div
          className="bg-[var(--bg-primary)] rounded-lg shadow-[var(--shadow)] overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-[var(--border-color)] flex flex-col"
        >
          <div className="p-5 flex-grow flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
                {snippet.title}
              </h3>
              <div className="flex items-center bg-[var(--bg-secondary)] dark-theme:bg-[var(--bg-secondary)] rounded-md p-1.5">
                {getLanguageIcon(snippet.language)}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {snippet.description}
            </p>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-auto pt-1">
              <span className="inline-block h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 mr-2"></span>
              <div>
                <span className="block">
                  {currentUser && snippet.owner?.id === currentUser.id
                    ? 'You'
                    : snippet.owner?.username || snippet.owner?.name || 'Unknown'}
                </span>
                <span className="text-xs">
                  {(() => {
                    if (!snippet.createdAt) return 'recently';
                    try {
                      const date = new Date(snippet.createdAt);
                      if (!isNaN(date.getTime())) {
                        return formatDistanceToNow(date, { addSuffix: true });
                      }
                      if (typeof snippet.createdAt === 'number') {
                        return formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true });
                      }
                      if (/^\d+$/.test(snippet.createdAt)) {
                        return formatDistanceToNow(new Date(parseInt(snippet.createdAt)), { addSuffix: true });
                      }
                      return 'recently';
                    } catch (error) {
                      console.error('Date parsing error:', error);
                      return 'recently';
                    }
                  })()}
                </span>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => onSnippetClick(snippet)}
            className="text-center py-3 border-t border-[var(--border-color)] text-blue-600 hover:underline cursor-pointer text-sm"
          >
            View Code
          </div>
        </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SnippetGrid;