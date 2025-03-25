import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getUserStats, getUser, getUpcomingContests } from '../services/codeforcesApi';
import { UserStats, Contest, Submission } from '../types/codeforces';
import { Activity, Award, CheckCircle, Send, Trophy, TrendingUp, Calendar, Target, Timer } from 'lucide-react';
import { format, fromUnixTime, startOfMonth, endOfMonth, eachDayOfInterval, isFuture } from 'date-fns';
import SubmissionModal from './SubmissionModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const tooltipStyle = {
  light: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    color: '#1f2937'
  },
  dark: {
    backgroundColor: '#374151',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
    color: '#f3f4f6'
  }
};

const CustomTooltip = ({ active, payload, label, isDark = false }) => {
  if (active && payload && payload.length) {
    return (
      <div style={isDark ? tooltipStyle.dark : tooltipStyle.light}>
        <p className="text-sm font-medium">{`${label || ''}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm">
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Submission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (handle) {
        try {
          const [statsData, userData, contestsData] = await Promise.all([
            getUserStats(handle),
            getUser(handle),
            getUpcomingContests()
          ]);
          setStats(statsData);
          setUserInfo(userData);
          setUpcomingContests(contestsData);
          localStorage.setItem('cfHandle', handle);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [handle]);

  const calculateAverageRating = (submissions: any[]) => {
    const solvedProblems = new Map();
    
    submissions.forEach(submission => {
      if (submission.verdict === 'OK' && submission.problem.rating) {
        const problemId = `${submission.problem.contestId}${submission.problem.index}`;
        solvedProblems.set(problemId, submission.problem.rating);
      }
    });

    if (solvedProblems.size === 0) return 0;

    const totalRating = Array.from(solvedProblems.values()).reduce((sum, rating) => sum + rating, 0);
    return Math.round(totalRating / solvedProblems.size);
  };

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const rating = data.activePayload[0].payload.rating;
      navigate(`/problems/${handle}?rating=${rating}&filter=solved`);
    }
  };

  const getSubmissionsForDate = (date: Date) => {
    if (!stats) return [];
    return stats.submissions.filter(submission => {
      const submissionDate = new Date(submission.creationTimeSeconds * 1000);
      return submissionDate.toDateString() === date.toDateString();
    });
  };

  const getSubmissionCountForDate = (date: Date) => {
    return getSubmissionsForDate(date).length;
  };

  const handleDateClick = (date: Date) => {
    const submissions = getSubmissionsForDate(date);
    if (submissions.length > 0) {
      setSelectedDate(date);
      setSelectedSubmissions(submissions);
      setIsModalOpen(true);
    }
  };

  const getColorIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (count <= 2) return 'bg-blue-100 dark:bg-blue-900';
    if (count <= 5) return 'bg-blue-200 dark:bg-blue-800';
    if (count <= 10) return 'bg-blue-300 dark:bg-blue-700';
    return 'bg-blue-400 dark:bg-blue-600';
  };

  const handleMonthChange = (increment: boolean) => {
    setSelectedMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (increment) {
        newMonth.setMonth(newMonth.getMonth() + 1);
        if (isFuture(startOfMonth(newMonth))) {
          return prevMonth;
        }
      } else {
        newMonth.setMonth(newMonth.getMonth() - 1);
      }
      return newMonth;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats || !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-red-500">Error loading stats</div>
      </div>
    );
  }

  const chartData = Object.entries(stats.problemsByRating)
    .filter(([rating]) => rating !== 'Unrated' && rating !== 'undefined')
    .map(([rating, count]) => ({
      rating,
      count,
    }));

  const calculateActiveDays = () => {
    const activeDays = new Set(
      stats.submissions.map(s => new Date(s.creationTimeSeconds * 1000).toLocaleDateString())
    );
    return activeDays.size;
  };

  const ratingProgressionData = stats.contests.map(contest => ({
    name: contest.contestName || contest.name,
    rating: contest.newRating
  }));

  const tagStats = stats.submissions.reduce((acc, submission) => {
    if (submission.verdict === 'OK') {
      submission.problem.tags.forEach(tag => {
        acc.solved[tag] = (acc.solved[tag] || 0) + 1;
      });
    } else {
      submission.problem.tags.forEach(tag => {
        acc.failed[tag] = (acc.failed[tag] || 0) + 1;
      });
    }
    return acc;
  }, { solved: {} as Record<string, number>, failed: {} as Record<string, number> });

  const mostSolvedTags = Object.entries(tagStats.solved)
    .map(([tag, count]) => ({ name: tag, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const weakestAreas = Object.entries(tagStats.failed)
    .map(([tag, failed]) => ({
      tag,
      failRate: failed / (failed + (tagStats.solved[tag] || 0))
    }))
    .filter(({ failRate }) => !isNaN(failRate))
    .sort((a, b) => b.failRate - a.failRate)
    .slice(0, 5);

  const averageRating = calculateAverageRating(stats.submissions);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth)
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOffset = startOfMonth(selectedMonth).getDay();

  const isCurrentMonth = startOfMonth(selectedMonth).getTime() === startOfMonth(new Date()).getTime();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <StatCard
            icon={<Trophy className="text-yellow-500" />}
            title="Current Rating"
            value={userInfo.rating || 'Unrated'}
            subtitle={`Rank: ${userInfo.rank || 'Unrated'}`}
          />
          <StatCard
            icon={<TrendingUp className="text-green-500" />}
            title="Maximum Rating"
            value={userInfo.maxRating || 'Unrated'}
            subtitle={`Max Rank: ${userInfo.maxRank || 'Unrated'}`}
          />
          <StatCard
            icon={<Target className="text-purple-500" />}
            title="Average Problem Rating"
            value={averageRating || 'N/A'}
            subtitle="Solved Problems"
          />
          <StatCard
            icon={<Activity className="text-purple-500" />}
            title="Solve Rate"
            value={`${((stats.totalSolved / stats.totalSubmissions) * 100).toFixed(1)}%`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <Link to={`/problems/${handle}?filter=solved`}>
            <StatCard
              icon={<CheckCircle className="text-green-500" />}
              title="Problems Solved"
              value={stats.totalSolved}
              isLink
            />
          </Link>
          <Link to={`/submissions/${handle}`}>
            <StatCard
              icon={<Send className="text-blue-500" />}
              title="Total Submissions"
              value={stats.totalSubmissions}
              isLink
            />
          </Link>
          <Link to={`/contests/${handle}`}>
            <StatCard
              icon={<Award className="text-yellow-500" />}
              title="Contests Participated"
              value={stats.totalContests}
              isLink
            />
          </Link>
          <StatCard
            icon={<Calendar className="text-blue-500" />}
            title="Active Days"
            value={calculateActiveDays()}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Problems by Rating</h2>
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} onClick={handleBarClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="rating" stroke={isDarkMode ? "#9CA3AF" : "#4B5563"} />
                  <YAxis stroke={isDarkMode ? "#9CA3AF" : "#4B5563"} />
                  <Tooltip content={<CustomTooltip isDark={isDarkMode} />} />
                  <Bar dataKey="count" fill="#4F46E5" style={{ cursor: 'pointer' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Rating Progression</h2>
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingProgressionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke={isDarkMode ? "#9CA3AF" : "#4B5563"} />
                  <Tooltip content={<CustomTooltip isDark={isDarkMode} />} />
                  <Line type="monotone" dataKey="rating" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Most Solved Tags</h2>
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mostSolvedTags}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mostSolvedTags.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip isDark={isDarkMode} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Weakest Areas</h2>
            <div className="space-y-4">
              {weakestAreas.map(({ tag, failRate }, index) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{tag}</span>
                  <div className="w-2/3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 dark:bg-red-600"
                        style={{ width: `${failRate * 100}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-right mt-1">
                      {(failRate * 100).toFixed(1)}% fail rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">Submission Activity</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMonthChange(false)}
                  className="p-1 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  ←
                </button>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {format(selectedMonth, 'MMMM yyyy')}
                </span>
                <button
                  onClick={() => handleMonthChange(true)}
                  disabled={isCurrentMonth}
                  className={`p-1 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${
                    isCurrentMonth ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  →
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 py-1 sm:py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: firstDayOffset }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              
              {daysInMonth.map(date => {
                const submissionCount = getSubmissionCountForDate(date);
                return (
                  <div
                    key={date.toISOString()}
                    className={`aspect-square rounded-xl ${getColorIntensity(submissionCount)} flex items-center justify-center transition-transform hover:scale-110 ${
                      submissionCount > 0 ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => submissionCount > 0 && handleDateClick(date)}
                  >
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{date.getDate()}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Submissions:</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 dark:bg-blue-900 rounded"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-200 dark:bg-blue-800 rounded"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-300 dark:bg-blue-700 rounded"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 dark:bg-blue-600 rounded"></div>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">More</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">Upcoming Contests</h2>
            </div>
            <div className="space-y-4">
              {upcomingContests.slice(0, 5).map((contest) => (
                <div key={contest.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <a
                    href={`https://codeforces.com/contests/${contest.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium block mb-1"
                  >
                    {contest.name}
                  </a>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Starts: {format(fromUnixTime(contest.startTimeSeconds), 'PPpp')}
                  </div>
                </div>
              ))}
              {upcomingContests.length === 0 && (
                <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No upcoming contests at the moment
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <SubmissionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
            setSelectedSubmissions([]);
          }}
          submissions={selectedSubmissions}
          date={selectedDate}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle?: string;
  isLink?: boolean;
}

function StatCard({ icon, title, value, subtitle, isLink }: StatCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-4 md:p-6 ${isLink ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="text-xl sm:text-2xl">{icon}</div>
      </div>
      <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1 text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{title}</div>
      {subtitle && (
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}