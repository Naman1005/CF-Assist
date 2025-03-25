import React, { useEffect, useState } from 'react';
import { getUserSubmissions } from '../services/codeforcesApi';
import { Submission } from '../types/codeforces';
import { CheckCircle } from 'lucide-react';

export default function SolvedProblems() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const handle = localStorage.getItem('cfHandle') || '';
        const submissionsData = await getUserSubmissions(handle);
        const solvedSubmissions = submissionsData.filter(s => s.verdict === 'OK');
        const uniqueSolved = Array.from(
          new Map(solvedSubmissions.map(s => [`${s.problem.contestId}${s.problem.index}`, s])).values()
        );
        setSubmissions(uniqueSolved);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

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
          <CheckCircle className="h-8 w-8 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-800">Solved Problems</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={`${submission.problem.contestId}${submission.problem.index}`}>
                    <td className="px-6 py-4">
                      <a
                        href={`https://codeforces.com/problemset/problem/${submission.problem.contestId}/${submission.problem.index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {submission.problem.name}
                      </a>
                    </td>
                    <td className="px-6 py-4">{submission.problem.rating || 'Unrated'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {submission.problem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}