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

function Navigation() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const handle = localStorage.getItem('cfHandle');
  
  if (isLoginPage) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Code className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold">CF-Assist</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <a
                href={`https://codeforces.com/profile/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {handle}
              </a>
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold"
              >
                {handle?.[0].toUpperCase()}
              </div>
            </div>
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
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-6">
        <Link
          to={`/dashboard/${handle}`} 
          className={`text-2xl font-bold ${isDashboard ? 'text-blue-600' : 'text-gray-600'}`}
        >
          Dashboard
        </Link>
        <div className="h-8 w-px bg-gray-300"></div>
        <Link
          to={`/problems/${handle}`} 
          className={`text-2xl font-bold ${isProblems ? 'text-blue-600' : 'text-gray-600'}`}
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
    <Router>
      <div className="min-h-screen bg-gray-50">
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
  );
}

export default App;
