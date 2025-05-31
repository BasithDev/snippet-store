import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_SNIPPETS } from '../apollo/Snippet/queries';
import SnippetModal from '../components/SnippetModal';
import SnippetGrid from '../components/SnippetGrid';
import Footer from '../components/Footer';

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [allSnippets, setAllSnippets] = useState([]);
  
  const ITEMS_PER_PAGE = 9;
  
  const [executeSearch, { loading: isLoading, error, data }] = useLazyQuery(SEARCH_SNIPPETS, {
    fetchPolicy: 'network-only',
    variables: {
      limit: ITEMS_PER_PAGE
    }
  });
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';
    setSearchQuery(query);
    
    setPage(1);
    setAllSnippets([]);
    
    if (query.trim()) {
      executeSearch({ 
        variables: { 
          query,
          page: 1,
          limit: ITEMS_PER_PAGE
        } 
      });
    }
  }, [location.search, executeSearch]);
  
  useEffect(() => {
    if (data?.searchSnippets) {
      if (page === 1) {
        setAllSnippets(data.searchSnippets.snippets);
      } else {
        const remainingCount = data.searchSnippets.totalCount - allSnippets.length;
        const newSnippetsToAdd = data.searchSnippets.snippets.slice(0, remainingCount);
        
        setAllSnippets(prev => [...prev, ...newSnippetsToAdd]);
      }
      
      const willHaveLoaded = (page === 1 ? 0 : allSnippets.length) + 
        (page === 1 ? data.searchSnippets.snippets.length : 
          Math.min(data.searchSnippets.snippets.length, data.searchSnippets.totalCount - allSnippets.length));
      
      setHasMore(willHaveLoaded < data.searchSnippets.totalCount);
      setTotalCount(data.searchSnippets.totalCount);
    }
  }, [data, page, allSnippets.length]);
  
  const openSnippetModal = (snippet) => {
    setSelectedSnippet(snippet);
  };
  
  const closeSnippetModal = () => {
    setSelectedSnippet(null);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const [newItemsStartIndex, setNewItemsStartIndex] = useState(null);
  
  const loadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setNewItemsStartIndex(allSnippets.length);
      setPage(nextPage);
      executeSearch({
        variables: {
          query: searchQuery,
          page: nextPage,
          limit: ITEMS_PER_PAGE
        }
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <main className="p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            Search Results for "{searchQuery}"
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p className="mb-2">Error performing search</p>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : allSnippets.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[var(--text-muted)] mb-4">
              Showing {allSnippets.length} of {totalCount} results
            </p>
            <SnippetGrid 
              snippets={allSnippets} 
              onSnippetClick={openSnippetModal} 
              newItemsStartIndex={newItemsStartIndex} 
            />
            
            {hasMore && (
              <div className="flex justify-center mt-8 mb-4">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  {isLoading && page > 1 ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        ) : searchQuery ? (
          <div className="text-center py-10">
            <p className="text-[var(--text-muted)] mb-2">No snippets found matching "{searchQuery}"</p>
            <p className="text-[var(--text-muted)] text-sm">Try a different search term or browse all snippets</p>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-[var(--text-muted)] mb-2">Enter a search term to find snippets</p>
          </div>
        )}
      </main>

      <Footer />
      
      <AnimatePresence>
        {selectedSnippet && (
          <SnippetModal 
            selectedSnippet={selectedSnippet} 
            closeSnippetModal={closeSnippetModal} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchResults;
