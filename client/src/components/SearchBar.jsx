import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['react hooks', 'css grid', 'python list']);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const suggestions = [
        'javascript',
        'javascript array methods',
        'javascript promises',
        'python',
        'python list comprehension',
        'css grid',
        'react hooks',
        'mongodb aggregation'
      ].filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase()) && 
        item.toLowerCase() !== searchQuery.toLowerCase()
      ).slice(0, 5);
      
      setSearchSuggestions(suggestions);
      if (suggestions.length > 0) {
        setShowSearchSuggestions(true);
      }
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (query) => {
    if (query.trim()) {
      if (!recentSearches.includes(query.trim().toLowerCase())) {
        setRecentSearches(prev => [query.trim(), ...prev].slice(0, 5));
      }
      
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSearchSuggestions(false);
    }
  };

  return (
    <div className="flex-1 max-w-xl mx-auto">
      <div className="relative" ref={searchRef}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
        >
          <input
            type="text"
            placeholder="Search snippets..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchSuggestions(true)}
          />
          <button 
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <svg className="w-5 h-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </form>
        
        {showSearchSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div 
            className="absolute mt-1 w-full bg-[var(--bg-primary)] rounded-md shadow-lg border border-[var(--border-color)] overflow-hidden z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {searchSuggestions.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs text-[var(--text-muted)] border-b border-[var(--border-color)]">Suggestions</div>
                <ul>
                  {searchSuggestions.map((suggestion, index) => (
                    <li key={`suggestion-${index}`}>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] flex items-center"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          handleSearch(suggestion);
                        }}
                      >
                        <svg className="w-4 h-4 mr-2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {recentSearches.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs text-[var(--text-muted)] border-b border-[var(--border-color)]">Recent Searches</div>
                <ul>
                  {recentSearches.map((search, index) => (
                    <li key={`recent-${index}`}>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] flex items-center"
                        onClick={() => {
                          setSearchQuery(search);
                          handleSearch(search);
                        }}
                      >
                        <svg className="w-4 h-4 mr-2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {search}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
