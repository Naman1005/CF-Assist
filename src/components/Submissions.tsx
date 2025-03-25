import React, { useEffect, useState } from 'react';
import { getUserSubmissions } from '../services/codeforcesApi';
import { Submission } from '../types/codeforces';
import { Send, Filter } from 'lucide-react';
import { format, addMinutes } from 'date-fns';

export default function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerdict, setSelectedVerdict] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const handle = localStorage.getItem('cfHandle') || '';
        const submissionsData = await getUserSubmissions(handle);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const convertToIST = (timestamp: number) => {
    const utcDate = new Date(timestamp * 1000);
    return addMinutes(utcDate, 330); // 5 hours and 30 minutes = 330 minutes
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (selectedVerdict === 'all') return true;
    return submission.verdict === selectedVerdict;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Send className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Submissions</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="mb-6 flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedVerdict}
              onChange={(e) => {
                setSelectedVerdict(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Verdicts</option>
              <option value="OK">Accepted</option>
              <option value="WRONG_ANSWER">Wrong Answer</option>
              <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
              <option value="COMPILATION_ERROR">Compilation Error</option>
              <option value="MEMORY_LIMIT_EXCEEDED">Memory Limit Exceeded</option>
              <option value="RUNTIME_ERROR">Runtime Error</option>
              <option value="OTHER">Others</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verdict</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4">
                      <a
                        href={`https://codeforces.com/contest/${submission.contestId}/submission/${submission.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {submission.problem.name}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        submission.verdict === 'OK' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {submission.verdict}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-300">
                      {format(convertToIST(submission.creationTimeSeconds), 'PPp')} IST
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}