import React, { useState, useEffect } from 'react'
import Footer from '../components/Footer'
import { AnimatePresence, motion } from 'framer-motion'
import SnippetModal from '../components/SnippetModal'
import CreateSnippetModal from '../components/CreateSnippetModal'
import SnippetGrid from '../components/SnippetGrid'
import { useQuery } from '@apollo/client'
import { GET_SNIPPETS } from '../apollo/Snippet/queries'

function Snippets() {
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const ITEMS_PER_PAGE = 9;

  const { loading, error, data, fetchMore } = useQuery(GET_SNIPPETS, {
    variables: {
      page: 1,
      limit: ITEMS_PER_PAGE
    },
    fetchPolicy: 'cache-and-network',
  });
  
  const openSnippetModal = (snippet) => {
    setSelectedSnippet(snippet);
    setCopied(false);
  };
  
  const closeSnippetModal = () => {
    setSelectedSnippet(null);
    setCopied(false);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };
  
  const closeCreateModal = () => {
    setShowCreateModal(false);
  };


  useEffect(() => {
    if (data?.getAllSnippets) {
      setSnippets(data.getAllSnippets.snippets);
      setHasMore(data.getAllSnippets.hasMore);
      setTotalCount(data.getAllSnippets.totalCount);
    }
  }, [data]);

  const [newItemsStartIndex, setNewItemsStartIndex] = useState(null);
  
  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setNewItemsStartIndex(snippets.length);
      setPage(nextPage);
      fetchMore({
        variables: {
          page: nextPage,
          limit: ITEMS_PER_PAGE
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          const remainingCount = prev.getAllSnippets.totalCount - prev.getAllSnippets.snippets.length;
          const newSnippetsToAdd = fetchMoreResult.getAllSnippets.snippets.slice(0, remainingCount);
          
          return {
            getAllSnippets: {
              ...fetchMoreResult.getAllSnippets,
              snippets: [
                ...prev.getAllSnippets.snippets,
                ...newSnippetsToAdd
              ],
              totalCount: fetchMoreResult.getAllSnippets.totalCount,
              hasMore: prev.getAllSnippets.snippets.length + newSnippetsToAdd.length < fetchMoreResult.getAllSnippets.totalCount
            }
          };
        }
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <main className="p-4">
        {error && (
          <div className="text-red-500 p-4 mb-4 bg-red-100 rounded-md">
            Error loading snippets: {error.message}
          </div>
        )}
        <motion.div
          initial="hidden"
          animate={loading ? "hidden" : "visible"}
          variants={containerVariants}
        >
            <motion.div 
              className="flex justify-between items-center mb-6"
              variants={itemVariants}
            >
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">New Snippets</h1>
              <motion.button 
                style={{
                  color: "white",
                }}
                onClick={openCreateModal}
                className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + New Snippet
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants}>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : snippets.length > 0 ? (
                <>
                  <div className="mb-4 text-[var(--text-muted)]">
                    Showing {snippets.length} of {totalCount} snippets
                  </div>
                  <SnippetGrid 
                    snippets={snippets} 
                    onSnippetClick={openSnippetModal} 
                    newItemsStartIndex={newItemsStartIndex} 
                  />
                  
                  {hasMore && (
                    <div className="flex justify-center mt-8 mb-4">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                      >
                        {loading && page > 1 ? (
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
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-[var(--text-muted)] mb-4">No public snippets found.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
      </main>

      <Footer />
      
      <AnimatePresence>
        {selectedSnippet && (
          <SnippetModal 
            selectedSnippet={selectedSnippet} 
            closeSnippetModal={closeSnippetModal} 
          />
        )}
        {showCreateModal && (
          <CreateSnippetModal closeModal={closeCreateModal} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Snippets;