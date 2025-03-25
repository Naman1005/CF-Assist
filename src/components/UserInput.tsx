import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code } from 'lucide-react';

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="relative">
        {/* Animated gradient border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-75 animate-gradient"></div>
        
        {/* Card */}
        <div className="relative px-8 py-10 bg-white rounded-lg shadow-2xl w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <Code className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            CF-Assist
          </h1>
          
          <p className="text-center text-gray-600 mb-8">
            Track your Codeforces journey
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Enter Codeforces Handle"
                className="w-full px-4 py-3 rounded-lg border-2 border-transparent bg-gray-50 focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <Search className="h-5 w-5 text-gray-500 hover:text-blue-500 transition-colors duration-200" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <p className="text-center text-gray-600 italic max-w-md mt-8 mx-4">
        "If you can't <del className="text-gray-400">measure</del> track it, you can't manage it."
        <br />
        <span className="text-sm">- Some random guy named Naman</span>
      </p>
    </div>
  );
}