import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SnippetModal from '../components/SnippetModal';
import SnippetGrid from '../components/SnippetGrid';
import Footer from '../components/Footer';
import { useQuery } from '@apollo/client';
import { GET_MY_SNIPPETS } from '../apollo/Snippet/queries';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import CreateSnippetModal from '../components/CreateSnippetModal';

function MySnippets() {
  const { currentUser } = useAuth();
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const ITEMS_PER_PAGE = 9;
  
  const { loading: snippetsLoading, error, data, fetchMore } = useQuery(GET_MY_SNIPPETS, {
    variables: {
      page: 1,
      limit: ITEMS_PER_PAGE
    },
    fetchPolicy: 'cache-and-network'
  });
  
  const openSnippetModal = (snippet) => {
    setSelectedSnippet(snippet);
  };
  
  const closeSnippetModal = () => {
    setSelectedSnippet(null);
  };
  
  const openCreateModal = () => {
    setShowCreateModal(true);
  };
  
  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  useEffect(() => {
    if (data?.getMySnippets) {
      setSnippets(data.getMySnippets.snippets);
      setHasMore(data.getMySnippets.hasMore);
      setTotalCount(data.getMySnippets.totalCount);
    }
  }, [data]);
  
  const handleSnippetDeleted = (deletedSnippetId) => {
    setSnippets(currentSnippets => 
      currentSnippets.filter(snippet => snippet.id !== deletedSnippetId)
    );
    setTotalCount(prev => Math.max(0, prev - 1));
  };
  
  const [newItemsStartIndex, setNewItemsStartIndex] = useState(null);
  
  const loadMore = () => {
    if (hasMore && !snippetsLoading) {
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
          
          const remainingCount = prev.getMySnippets.totalCount - prev.getMySnippets.snippets.length;
          const newSnippetsToAdd = fetchMoreResult.getMySnippets.snippets.slice(0, remainingCount);
          
          return {
            getMySnippets: {
              ...fetchMoreResult.getMySnippets,
              snippets: [
                ...prev.getMySnippets.snippets,
                ...newSnippetsToAdd
              ],
              totalCount: fetchMoreResult.getMySnippets.totalCount,
              hasMore: prev.getMySnippets.snippets.length + newSnippetsToAdd.length < fetchMoreResult.getMySnippets.totalCount
            }
          };
        }
      });
    }
  };
  
  const mySnippets = snippets

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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
            <motion.div 
              className="flex justify-between items-center mb-6"
              variants={itemVariants}
            >
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Snippets</h1>
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
              {error && (
                <div className="text-red-500 p-4 mb-4 bg-red-100 rounded-md">
                  Error loading snippets: {error.message}
                </div>
              )}
              
              {snippetsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : mySnippets.length > 0 ? (
                <>
                  <div className="mb-4 text-[var(--text-muted)]">
                    Showing {mySnippets.length} of {totalCount} snippets
                  </div>
                  <SnippetGrid 
                    snippets={mySnippets} 
                    onSnippetClick={openSnippetModal} 
                    newItemsStartIndex={newItemsStartIndex} 
                  />
                  
                  {hasMore && (
                    <div className="flex justify-center mt-8 mb-4">
                      <button
                        onClick={loadMore}
                        disabled={snippetsLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                      >
                        {snippetsLoading && page > 1 ? (
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
                <motion.div 
                  className="text-center py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <p className="text-[var(--text-muted)] mb-4">You haven't created any snippets yet.</p>
                  <motion.button 
                    style={{ color: "white" }}
                    className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openCreateModal}
                  >
                    Create Your First Snippet
                  </motion.button>
                </motion.div>
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
            onDeleteSuccess={handleSnippetDeleted}
          />
        )}
        {showCreateModal && (
          <CreateSnippetModal closeModal={closeCreateModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MySnippets;
