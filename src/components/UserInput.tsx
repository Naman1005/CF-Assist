
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function UserInput() {
  const [handle, setHandle] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      localStorage.setItem('cfHandle', handle.trim());
      navigate(`/dashboard/${handle}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Glow effect added here */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-80 blur-lg animate-pulse"></div>
        
        <div className="relative px-4 sm:px-8 py-6 sm:py-10 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            CF-Assist
          </h1>
          
          <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
            Track your Codeforces journey
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Enter Codeforces Handle"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-700 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 outline-none dark:text-white text-sm sm:text-base"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic max-w-xs sm:max-w-md mt-6 sm:mt-8 mx-4">
        "If you can't <del className="text-gray-400 dark:text-gray-500">measure</del> track it, you can't manage it."
        <br />
        <span className="text-xs">- Some random guy named Naman</span>
      </p>
    </div>
  );
}
