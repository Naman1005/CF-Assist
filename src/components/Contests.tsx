import React, { useEffect, useState } from 'react';
import { getUserContests } from '../services/codeforcesApi';
import { Contest } from '../types/codeforces';
import { Award, TrendingDown, TrendingUp } from 'lucide-react';

export default function Contests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const handle = localStorage.getItem('cfHandle') || '';
        const contestsData = await getUserContests(handle);
        setContests(contestsData);
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalPages = Math.ceil(contests.length / itemsPerPage);
  const paginatedContests = contests.slice(
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
          <Award className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-800">Contest History</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Rating</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedContests.map((contest) => (
                  <tr key={contest.contestId || contest.id}>
                    <td className="px-6 py-4">
                      <a
                        href={`https://codeforces.com/contest/${contest.contestId || contest.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {contest.contestName || contest.name}
                      </a>
                    </td>
                    <td className="px-6 py-4">{contest.rank}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      {contest.newRating - contest.oldRating > 0 ? (
                        <TrendingUp className="text-green-500 h-4 w-4" />
                      ) : (
                        <TrendingDown className="text-red-500 h-4 w-4" />
                      )}
                      <span className={contest.newRating - contest.oldRating > 0 ? 'text-green-600' : 'text-red-600'}>
                        {contest.newRating - contest.oldRating > 0 ? '+' : ''}{contest.newRating - contest.oldRating}
                      </span>
                    </td>
                    <td className="px-6 py-4">{contest.newRating}</td>
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