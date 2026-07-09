import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SEO from './components/SEO';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NoticeAnalysis from './pages/NoticeAnalysis';
import EligibilityPage from './pages/EligibilityPage';
import DocumentVerification from './pages/DocumentVerification';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <SEO />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/analyze" element={<ProtectedRoute><NoticeAnalysis /></ProtectedRoute>} />
                <Route path="/eligibility" element={<ProtectedRoute><EligibilityPage /></ProtectedRoute>} />
                <Route path="/verify" element={<ProtectedRoute><DocumentVerification /></ProtectedRoute>} />
                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#0F172A',
                  color: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)'
                },
                success: {
                  iconTheme: {
                    primary: '#138808',
                    secondary: '#F8FAFC',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#DC2626',
                    secondary: '#F8FAFC',
                  },
                }
              }}
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
