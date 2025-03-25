import React, { useEffect, useState } from 'react';
import { getUserSubmissions } from '../services/codeforcesApi';
import { Submission } from '../types/codeforces';
import { Send, Filter } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Send className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800">Submissions</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6 flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedVerdict}
              onChange={(e) => {
                setSelectedVerdict(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verdict</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4">
                      <a
                        href={`https://codeforces.com/contest/${submission.contestId}/submission/${submission.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {submission.problem.name}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        submission.verdict === 'OK' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {submission.verdict}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(submission.creationTimeSeconds * 1000).toLocaleString()}
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
                className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:bg-gray-300"
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