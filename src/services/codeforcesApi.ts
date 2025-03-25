import axios from 'axios';
import { Problem, Submission, Contest, UserStats } from '../types/codeforces';

const API_BASE_URL = 'https://codeforces.com/api';

export const getUser = async (handle: string) => {
  const response = await axios.get(`${API_BASE_URL}/user.info?handles=${handle}`);
  return response.data.result[0];
};

export const getUserSubmissions = async (handle: string) => {
  const response = await axios.get(`${API_BASE_URL}/user.status?handle=${handle}`);
  return response.data.result as Submission[];
};

export const getUserContests = async (handle: string) => {
  const response = await axios.get(`${API_BASE_URL}/user.rating?handle=${handle}`);
  return response.data.result as Contest[];
};

export const getProblems = async () => {
  const response = await axios.get(`${API_BASE_URL}/problemset.problems`);
  return response.data.result.problems as Problem[];
};

export const getUpcomingContests = async () => {
  const response = await axios.get(`${API_BASE_URL}/contest.list`);
  return response.data.result.filter((contest: Contest) => 
    contest.phase === 'BEFORE'
  ).sort((a: Contest, b: Contest) => 
    a.startTimeSeconds - b.startTimeSeconds
  );
};

export const getUserStats = async (handle: string): Promise<UserStats> => {
  const [submissions, contests] = await Promise.all([
    getUserSubmissions(handle),
    getUserContests(handle),
  ]);

  const solvedProblems = new Set();
  const problemsByRating: { [key: string]: number } = {};
  const submissionDates = new Map<string, number>();

  submissions.forEach((submission) => {
    if (submission.verdict === 'OK') {
      solvedProblems.add(`${submission.problem.contestId}${submission.problem.index}`);
      const rating = submission.problem.rating || 'Unrated';
      problemsByRating[rating] = (problemsByRating[rating] || 0) + 1;

      // Count submissions by date
      const date = new Date(submission.creationTimeSeconds * 1000).toISOString().split('T')[0];
      submissionDates.set(date, (submissionDates.get(date) || 0) + 1);
    }
  });

  // Convert submission dates to array format for heatmap
  const activityData = Array.from(submissionDates.entries()).map(([date, count]) => ({
    date,
    count
  }));

  return {
    handle,
    totalSolved: solvedProblems.size,
    totalSubmissions: submissions.length,
    totalContests: contests.length,
    problemsByRating,
    submissions,
    contests,
    activityData
  };
};