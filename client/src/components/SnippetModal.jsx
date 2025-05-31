import React, { useState, useEffect, useRef } from 'react';
import { useMutation, gql } from '@apollo/client';
import { DELETE_SNIPPET } from '../apollo/Snippet/mutations';
import { GET_SNIPPETS, GET_MY_SNIPPETS } from '../apollo/Snippet/queries';
import { motion } from 'framer-motion';
import { format, isValid } from 'date-fns';
import { getLanguageIcon } from './LanguageIcon';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CodeHighlight = ({ code, language }) => {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <pre className="p-4 overflow-auto bg-[var(--bg-secondary)] m-0">
      <code ref={codeRef} className={`language-${language} text-sm`}>
        {code}
      </code>
    </pre>
  );
};

function SnippetModal({ selectedSnippet, closeSnippetModal, onDeleteSuccess }) {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { currentUser } = useAuth();
  
  const isOwner = currentUser && selectedSnippet?.owner?.id === currentUser.id;

  const [deleteSnippet, { loading: deleting }] = useMutation(DELETE_SNIPPET, {
    optimisticResponse: {
      deleteSnippet: true
    },
    update: (cache, { data: { deleteSnippet } }) => {
      if (deleteSnippet) {
        cache.evict({ id: `Snippet:${selectedSnippet.id}` });
        cache.gc();
        
        try {
          const existingSnippetsData = cache.readQuery({
            query: GET_SNIPPETS,
            variables: { page: 1, limit: 9 }
          });
          
          if (existingSnippetsData) {
            const filteredSnippets = existingSnippetsData.getAllSnippets.snippets.filter(
              snippet => snippet.id !== selectedSnippet.id
            );
            
            cache.writeQuery({
              query: GET_SNIPPETS,
              variables: { page: 1, limit: 9 },
              data: {
                getAllSnippets: {
                  ...existingSnippetsData.getAllSnippets,
                  snippets: filteredSnippets,
                  totalCount: Math.max(0, existingSnippetsData.getAllSnippets.totalCount - 1)
                }
              }
            });
          }
        } catch (e) {
          console.log('Note: GET_SNIPPETS cache not updated:', e.message);
        }
        
        try {
          const existingMySnippetsData = cache.readQuery({
            query: GET_MY_SNIPPETS,
            variables: { page: 1, limit: 9 }
          });
          
          if (existingMySnippetsData) {
            const filteredMySnippets = existingMySnippetsData.getMySnippets.snippets.filter(
              snippet => snippet.id !== selectedSnippet.id
            );
            
            cache.writeQuery({
              query: GET_MY_SNIPPETS,
              variables: { page: 1, limit: 9 },
              data: {
                getMySnippets: {
                  ...existingMySnippetsData.getMySnippets,
                  snippets: filteredMySnippets,
                  totalCount: Math.max(0, existingMySnippetsData.getMySnippets.totalCount - 1)
                }
              }
            });
          }
        } catch (e) {
          console.log('Note: GET_MY_SNIPPETS cache not updated:', e.message);
        }
        cache.modify({
          fields: {
            getAllSnippets: (existing = { snippets: [], totalCount: 0, hasMore: false }) => {
              return {
                ...existing,
                snippets: existing.snippets.filter(snippetRef => {
                  const snippetId = snippetRef.__ref ? snippetRef.__ref.split(':')[1] : null;
                  return snippetId !== selectedSnippet.id;
                }),
                totalCount: Math.max(0, existing.totalCount - 1)
              };
            },
            getMySnippets: (existing = { snippets: [], totalCount: 0, hasMore: false }) => {
              return {
                ...existing,
                snippets: existing.snippets.filter(snippetRef => {
                  const snippetId = snippetRef.__ref ? snippetRef.__ref.split(':')[1] : null;
                  return snippetId !== selectedSnippet.id;
                }),
                totalCount: Math.max(0, existing.totalCount - 1)
              };
            }
          }
        });
      }
    },
    onCompleted: () => {
      toast.success('Snippet deleted successfully');
      if (onDeleteSuccess) {
        onDeleteSuccess(selectedSnippet.id);
      }
      closeSnippetModal();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete snippet');
    }
  });

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    deleteSnippet({ variables: { id: selectedSnippet.id } });
    setShowDeleteConfirm(false);
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const copyCodeToClipboard = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch((error) => {
        console.error('Failed to copy code:', error);
        toast.error('Failed to copy code to clipboard');
      });
  };

  if (!selectedSnippet) return null;

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeSnippetModal}
    >
      <motion.div 
        className="bg-[var(--bg-primary)] rounded-lg shadow-[var(--shadow)] overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedSnippet.title}</h2>
            <div className="flex items-center bg-[var(--bg-secondary)] dark-theme:bg-[var(--bg-secondary)] rounded-md p-2 ml-3">
              {getLanguageIcon(selectedSnippet.language)}
            </div>
          </div>
          <button 
            onClick={closeSnippetModal}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm hover:underline focus:outline-none cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <div className='mb-6'>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Language</h3>
            <p className="text-gray-600 dark:text-gray-300">{selectedSnippet.language.charAt(0).toUpperCase() + selectedSnippet.language.slice(1)}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300">{selectedSnippet.description}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Code</h3>
            <div className="rounded-lg overflow-hidden border border-[var(--border-color)]">
              <CodeHighlight code={selectedSnippet.code} language={selectedSnippet.language} />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-[var(--border-color)] flex justify-between items-center text-sm text-[var(--text-muted)]">
          <div className="flex items-center">
            <span className="inline-block h-8 w-8 rounded-full bg-[var(--bg-secondary)] mr-2"></span>
            <div>
              <span className="block">
                {isOwner 
                  ? 'by You' 
                  : `by ${selectedSnippet.owner?.username || selectedSnippet.owner?.name || 'Unknown'}`}
              </span>
              <span className="block text-xs">
                {(() => {
                  if (!selectedSnippet.createdAt) return 'Unknown date';
                  try {
                    const date = new Date(selectedSnippet.createdAt);
                    if (!isNaN(date.getTime())) {
                      return format(date, 'MMM d, yyyy');
                    }
                    if (typeof selectedSnippet.createdAt === 'number') {
                      return format(new Date(selectedSnippet.createdAt), 'MMM d, yyyy');
                    }
                    if (/^\d+$/.test(selectedSnippet.createdAt)) {
                      return format(new Date(parseInt(selectedSnippet.createdAt)), 'MMM d, yyyy');
                    }
                    return 'Invalid date format';
                  } catch (error) {
                    console.error('Date parsing error:', error);
                    return 'Error parsing date';
                  }
                })()}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{color: "white"}}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-all duration-200 text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button 
              onClick={() => copyCodeToClipboard(selectedSnippet.code)}
              style={{color: "white"}}
              className={`px-4 py-2 rounded-md bg-blue-600 transition-all duration-200 text-sm font-medium cursor-pointer flex items-center gap-2 ${copied ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              disabled={copied}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div 
          className="absolute inset-0 bg-black/70 flex items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div 
            className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Confirm Deletion</h3>
            <p className="text-[var(--text-secondary)] mb-6">Are you sure you want to delete this snippet? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-all duration-200 text-sm font-medium text-white flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Snippet'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
export default SnippetModal;