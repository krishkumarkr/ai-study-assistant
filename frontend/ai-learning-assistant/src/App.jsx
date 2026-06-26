import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // REMOVED BrowserRouter
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DocumentListPage from './pages/Documents/DocumentListPage';
import DocumentDetailPage from './pages/Documents/DocumentDetailPage';
import FlashcardsListPage from './pages/Flashcards/FlashcardsListPage';
import FlashcardPage from './pages/Flashcards/FlashcardPage';
import QuizResultPage from './pages/Quizzes/QuizResultPage';
import ProfilePage from './pages/Profile/ProfilePage';
import QuizTakePage from './pages/Quizzes/QuizTakePage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/Landing/LandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const App = () => {
  
  const { isAuthenticated, loading } = useAuth()

  if(loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <p className="text-emerald-500 font-bold tracking-widest uppercase animate-pulse">Loading...</p>
      </div>
    );
  }

  // REMOVED the <Router> wrapper entirely. <Routes> is now the top level.
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute  />}>
        <Route path="/dashboard" element={<DashboardPage />}/>
        <Route path="/documents" element={<DocumentListPage />}/>
        <Route path="/documents/:id" element={<DocumentDetailPage />}/>
        <Route path="/flashcards" element={<FlashcardsListPage />}/>
        <Route path="/documents/:id/flashcards" element={<FlashcardPage />}/>
        <Route path="/quizzes/:quizId" element={<QuizTakePage />}/>
        <Route path="/quizzes/:quizId/results" element={<QuizResultPage />}/>
        <Route path="/profile" element={<ProfilePage />}/>
      </Route>
        
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
  );

}

export default App;