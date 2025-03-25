import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getProblems, getUserSubmissions } from '../services/codeforcesApi';
import { Problem, Submission } from '../types/codeforces';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

type SortOption = 'default' | 'rating-up' | 'rating-down';
type FilterOption = 'all' | 'solved' | 'unsolved';

export default function Problems() {
  const { handle } = useParams<{ handle: string }>();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!handle) {
      navigate('/');
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const initialFilter = searchParams.get('filter') as FilterOption;
    const initialRating = searchParams.get('rating');
    
    if (initialFilter) {
      setFilterOption(initialFilter);
    }
    if (initialRating) {
      setSelectedRating(initialRating);
    }
  }, [location, handle, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!handle) return;

      try {
        const [problemsData, submissionsData] = await Promise.all([
          getProblems(),
          getUserSubmissions(handle)
        ]);
        setProblems(problemsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, [handle]);

  const allTags = Array.from(new Set(problems.flatMap(p => p.tags))).sort();
  const allRatings = Array.from(new Set(problems.map(p => p.rating))).sort((a, b) => a - b);

  const solvedProblemIds = new Set(
    submissions
      .filter(s => s.verdict === 'OK')
      .map(s => `${s.problem.contestId}${s.problem.index}`)
  );

  const sortProblems = (problems: Problem[]) => {
    switch (sortOption) {
      case 'rating-up':
        return [...problems].sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case 'rating-down':
        return [...problems].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return problems;
    }
  };

  const filteredProblems = sortProblems(problems.filter(problem => {
    const matchesSearch = problem.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = !selectedRating || 
      (selectedRating === 'unrated' && !problem.rating) ||
      problem.rating === parseInt(selectedRating);
    const matchesTag = !selectedTag || problem.tags.includes(selectedTag);
    const problemId = `${problem.contestId}${problem.index}`;
    const matchesStatus = filterOption === 'all' 
      ? true 
      : filterOption === 'solved' 
        ? solvedProblemIds.has(problemId)
        : !solvedProblemIds.has(problemId);
    return matchesSearch && matchesRating && matchesTag && matchesStatus;
  }));

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = filteredProblems.slice(
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <div className="relative">
              <select
                value={selectedRating}
                onChange={(e) => {
                  setSelectedRating(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              >
                <option value="">All Ratings</option>
                <option value="unrated">Unrated</option>
                {allRatings.filter(r => r).map(rating => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full px-3 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 flex items-center justify-between dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              >
                <span>Sort by: {sortOption}</span>
                {sortOption === 'rating-up' ? <SortAsc size={18} /> : <SortDesc size={18} />}
              </button>
              {showSortMenu && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => { setSortOption('default'); setShowSortMenu(false); }}
                    className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white text-sm sm:text-base"
                  >
                    Default
                  </button>
                  <button
                    onClick={() => { setSortOption('rating-up'); setShowSortMenu(false); }}
                    className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white text-sm sm:text-base"
                  >
                    Rating (Low to High)
                  </button>
                  <button
                    onClick={() => { setSortOption('rating-down'); setShowSortMenu(false); }}
                    className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white text-sm sm:text-base"
                  >
                    Rating (High to Low)
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="w-full px-3 sm:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 flex items-center justify-between dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              >
                <span>Filter: {filterOption}</span>
                <Filter size={18} />
              </button>
              {showFilterMenu && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => { setFilterOption('all'); setShowFilterMenu(false); }}
                    className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white text-sm sm:text-base"
                  >
                    All Problems
                  </button>
                  <button
                    onClick={() => { setFilterOption('solved'); setShowFilterMenu(false); }}
                    className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white text-sm sm:text-base"
                  >
                    Solved
                  </button>
                  <button
                    onClick={() => { setFilterOption('unsolved'); setShowFilterMenu(false); }}
                    className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white text-sm sm:text-base"
                  >
                    Unsolved
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-600 py-2">
                    <div className="px-3 sm:px-4 py-1 text-sm font-semibold text-gray-500 dark:text-gray-400">Tags</div>
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => { setSelectedTag(tag); setShowFilterMenu(false); }}
                        className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white text-sm sm:text-base"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedProblems.map((problem) => {
                    const problemId = `${problem.contestId}${problem.index}`;
                    const isSolved = solvedProblemIds.has(problemId);
                    return (
                      <tr key={problemId}>
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          <a
                            href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm sm:text-base"
                          >
                            {problem.name}
                          </a>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-900 dark:text-gray-300 text-sm sm:text-base">{problem.rating || 'Unrated'}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {problem.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isSolved ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {isSolved ? 'Solved' : 'Unsolved'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 sm:mt-6 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 rounded-xl bg-blue-500 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 text-sm sm:text-base"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 rounded-xl bg-blue-500 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 text-sm sm:text-base"
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