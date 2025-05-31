import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMutation, gql } from '@apollo/client';
import { CREATE_SNIPPET } from '../apollo/Snippet/mutations';
import { GET_SNIPPETS, GET_MY_SNIPPETS } from '../apollo/Snippet/queries';
import { useAuth } from '../context/AuthContext';

function CreateSnippetModal({ closeModal }) {
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    language: 'javascript',
    code: '',
    description: '',
    visibility: 'public'
  });

  const languages = [
    'javascript',
    'python',
    'java',
    'c++',
    'ruby',
    'swift',
    'go',
    'php',
    'typescript',
    'rust',
    'sql',
    'bash',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [createSnippet, { loading }] = useMutation(CREATE_SNIPPET, {
    update: (cache, { data: { createSnippet } }) => {
      cache.modify({
        fields: {
          getAllSnippets: (existing = { snippets: [], totalCount: 0, hasMore: false }) => {
            if (createSnippet.visibility !== 'public') return existing;
            
            const newSnippetRef = cache.writeFragment({
              data: createSnippet,
              fragment: gql`
                fragment NewSnippet on Snippet {
                  id
                  title
                  description
                  code
                  language
                  visibility
                  createdAt
                  updatedAt
                  owner {
                    id
                    username
                  }
                }
              `
            });
            
            const exists = existing.snippets.some(ref => {
              return ref.__ref === `Snippet:${createSnippet.id}`;
            });
            
            if (exists) return existing;
            
            return {
              ...existing,
              snippets: [newSnippetRef, ...existing.snippets],
              totalCount: existing.totalCount + 1
            };
          },
          getMySnippets: (existing = { snippets: [], totalCount: 0, hasMore: false }) => {
            const newSnippetRef = cache.writeFragment({
              data: createSnippet,
              fragment: gql`
                fragment NewSnippet on Snippet {
                  id
                  title
                  description
                  code
                  language
                  visibility
                  createdAt
                  updatedAt
                  owner {
                    id
                    username
                  }
                }
              `
            });
            
            const exists = existing.snippets.some(ref => {
              return ref.__ref === `Snippet:${createSnippet.id}`;
            });
            
            if (exists) return existing;
            
            return {
              ...existing,
              snippets: [newSnippetRef, ...existing.snippets],
              totalCount: existing.totalCount + 1
            };
          }
        }
      });
    },
    onCompleted: () => {
      toast.success('Snippet created successfully!');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create snippet. Please try again.');
      console.error('Error creating snippet:', error);
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.error('You must be logged in to create snippets');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await createSnippet({
        variables: {
          input: {
            title: formData.title,
            language: formData.language,
            code: formData.code,
            description: formData.description || "",
            visibility: formData.visibility
          }
        }
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeModal}
    >
      <motion.div 
        className="bg-[var(--bg-primary)] rounded-lg shadow-[var(--shadow)] overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Create New Snippet</h2>
          <button 
            onClick={closeModal}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm hover:underline focus:outline-none cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a title for your snippet"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="language" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Language <span className="text-red-500">*</span>
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <textarea
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                rows="6"
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste your code here"
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a description (optional)"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Visibility <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={handleChange}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-[var(--text-primary)]">Public</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={formData.visibility === 'private'}
                    onChange={handleChange}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-[var(--text-primary)]">Private</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-[var(--border-color)] rounded-md text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                style={{color:"white"}}
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create Snippet'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default CreateSnippetModal;
