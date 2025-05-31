import Home from "./pages/Home"
import Snippets from "./pages/Snippets"
import MySnippets from "./pages/MySnippets"
import SearchResults from "./pages/SearchResults"
import NotFound from "./pages/NotFound"
import ProtectedLayout from "./layouts/ProtectedLayout"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import CustomApolloProvider from "./apollo/ApolloProvider"
import "./styles/theme.css"

function App() {
  return (
    <CustomApolloProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'white',
                },
              },
            }}
          />
          <Routes>
            {/* Public route */}
            <Route path="/" element={<Home />} />
            
            {/* Protected routes - all nested under the ProtectedLayout */}
            <Route element={<ProtectedLayout />}>
              <Route path="/snippets" element={<Snippets />} />
              <Route path="/my-snippets" element={<MySnippets />} />
              <Route path="/search" element={<SearchResults />} />
            </Route>
            
            {/* 404 route - catches all unmatched paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </CustomApolloProvider>
  )
}

export default App;
