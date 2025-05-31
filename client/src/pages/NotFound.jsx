import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <h1 className="text-9xl font-bold text-[var(--text-primary)] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Page Not Found</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Go Home
              </motion.button>
            </Link>
            <Link to="/snippets">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors w-full sm:w-auto"
              >
                Browse Snippets
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFound;
