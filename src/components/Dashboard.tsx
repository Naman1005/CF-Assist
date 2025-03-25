import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getUserStats, getUser } from '../services/codeforcesApi';
import { UserStats } from '../types/codeforces';
import { Activity, Award, CheckCircle, Send, Trophy, TrendingUp, Calendar, Target } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (handle) {
        try {
          const [statsData, userData] = await Promise.all([
            getUserStats(handle),
            getUser(handle)
          ]);
          setStats(statsData);
          setUserInfo(userData);
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
    
    // Get unique solved problems with their ratings
    submissions.forEach(submission => {
      if (submission.verdict === 'OK' && submission.problem.rating) {
        const problemId = `${submission.problem.contestId}${submission.problem.index}`;
        solvedProblems.set(problemId, submission.problem.rating);
      }
    });

    if (solvedProblems.size === 0) return 0;

    // Calculate average rating
    const totalRating = Array.from(solvedProblems.values()).reduce((sum, rating) => sum + rating, 0);
    return Math.round(totalRating / solvedProblems.size);
  };

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const rating = data.activePayload[0].payload.rating;
      navigate(`/problems/${handle}?rating=${rating}&filter=solved`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats || !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  // Calculate active days (days with at least one submission)
  const calculateActiveDays = () => {
    const activeDays = new Set(
      stats.submissions.map(s => new Date(s.creationTimeSeconds * 1000).toLocaleDateString())
    );
    return activeDays.size;
  };

  // Calculate rating progression
  const ratingProgressionData = stats.contests.map(contest => ({
    name: contest.contestName || contest.name,
    rating: contest.newRating
  }));

  // Calculate tag statistics
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Problems by Rating</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} onClick={handleBarClick}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" style={{ cursor: 'pointer' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Rating Progression</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingProgressionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rating" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Most Solved Tags</h2>
            <div className="h-80">
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Weakest Areas</h2>
            <div className="space-y-4">
              {weakestAreas.map(({ tag, failRate }, index) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className="text-gray-700">{tag}</span>
                  <div className="w-2/3">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${failRate * 100}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 text-right mt-1">
                      {(failRate * 100).toFixed(1)}% fail rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
    <div className={`bg-white rounded-lg shadow-lg p-6 ${isLink ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-gray-600">{title}</div>
      {subtitle && (
        <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}