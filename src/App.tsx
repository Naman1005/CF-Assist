import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Code } from 'lucide-react';
import UserInput from './components/UserInput';
import Dashboard from './components/Dashboard';
import Problems from './components/Problems';
import SolvedProblems from './components/SolvedProblems';
import Submissions from './components/Submissions';
import Contests from './components/Contests';
import PrivateRoute from './components/PrivateRoute';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';

function Navigation() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const handle = localStorage.getItem('cfHandle');
  
  if (isLoginPage) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between h-12 sm:h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <span className="ml-2 text-lg sm:text-xl font-bold dark:text-white">CF-Assist</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href={`https://codeforces.com/profile/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {handle}
              </a>
              <div 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base"
              >
                {handle?.[0].toUpperCase()}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

function PageHeader() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const isDashboard = location.pathname.includes('/dashboard');
  const isProblems = location.pathname.includes('/problems');
  const handle = localStorage.getItem('cfHandle');
  
  if (isLoginPage) return null;

  return (
    <div className="flex items-center justify-between mb-4 sm:mb-8">
      <div className="flex items-center gap-4 sm:gap-6">
        <Link
          to={`/dashboard/${handle}`}
          className={`text-xl sm:text-2xl font-bold ${isDashboard ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          Dashboard
        </Link>
        <div className="h-6 sm:h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
        <Link
          to={`/problems/${handle}`}
          className={`text-xl sm:text-2xl font-bold ${isProblems ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
        >
          Problems
        </Link>
      </div>
    </div>
  );
}

function App() {
  const handle = localStorage.getItem('cfHandle');

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <PageHeader />
            <Routes>
              <Route path="/" element={<UserInput />} />
              <Route path="/dashboard" element={<Navigate to={handle ? `#/dashboard/${handle}` : '#/' } replace />} />
              <Route path="/dashboard/:handle" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/problems" element={<Navigate to={handle ? `#/problems/${handle}` : '#/' } replace />} />
              <Route path="/problems/:handle" element={
                <PrivateRoute>
                  <Problems />
                </PrivateRoute>
              } />
              <Route path="/solved-problems" element={<Navigate to={handle ? `#/solved-problems/${handle}` : '#/' } replace />} />
              <Route path="/solved-problems/:handle" element={
                <PrivateRoute>
                  <SolvedProblems />
                </PrivateRoute>
              } />
              <Route path="/submissions" element={<Navigate to={handle ? `#/submissions/${handle}` : '#/' } replace />} />
              <Route path="/submissions/:handle" element={
                <PrivateRoute>
                  <Submissions />
                </PrivateRoute>
              } />
              <Route path="/contests" element={<Navigate to={handle ? `#/contests/${handle}` : '#/' } replace />} />
              <Route path="/contests/:handle" element={
                <PrivateRoute>
                  <Contests />
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;