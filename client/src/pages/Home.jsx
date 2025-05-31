import { useState, useEffect } from 'react'
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from "../components/Header"
import Footer from "../components/Footer"
import AuthModal from "../components/AuthModal"
import { useAuth } from "../context/AuthContext"

const Home = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const controls = useAnimation();
    const { scrollYProgress } = useScroll();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    const titleY = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -50]);
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2,
                duration: 0.8
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: 'spring', stiffness: 100, damping: 10 }
        }
    };
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoaded(true);
            controls.start('visible');
        }, 300);
        
        return () => clearTimeout(timer);
    }, [controls]);

    const openAuthModal = () => {
        if (isAuthenticated()) {
            navigate('/snippets');
        } else {
            setIsAuthModalOpen(true);
        }
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            
            <main className="flex-grow flex items-center justify-center px-4 py-16 min-h-screen overflow-hidden">
                <motion.div 
                    className="text-center max-w-3xl mx-auto"
                    initial="hidden"
                    animate={controls}
                    variants={containerVariants}
                >
                    <motion.div style={{ y: titleY }}>
                        <motion.h1 
                            className="text-5xl md:text-6xl font-bold mb-6"
                            variants={itemVariants}
                        >
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            >
                                Your Code Snippets,
                            </motion.span>
                            <motion.span 
                                className="block mt-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                            >
                                All in One Place
                            </motion.span>
                        </motion.h1>
                    </motion.div>
                    
                    <motion.div style={{ y: subtitleY }}>
                        <motion.p 
                            className="text-xl md:text-2xl mb-10 opacity-80"
                            variants={itemVariants}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.8 }}
                        >
                            Store, organize, and share your code templates effortlessly.
                            Never lose a useful code snippet again.
                        </motion.p>
                    </motion.div>
                    
                    <button 
                        onClick={openAuthModal}
                        className="px-8 py-3 text-lg font-medium rounded-md primary-button blink-shadow cursor-pointer"
                    >
                        Get Started
                    </button>
                </motion.div>
            </main>
            
            <Footer />
            <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
        </div>
    )
}

export default Home;