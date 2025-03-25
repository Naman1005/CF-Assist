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

export const getUserStats = async (handle: string): Promise<UserStats> => {
  const [submissions, contests] = await Promise.all([
    getUserSubmissions(handle),
    getUserContests(handle),
  ]);

  const solvedProblems = new Set();
  const problemsByRating: { [key: string]: number } = {};

  submissions.forEach((submission) => {
    if (submission.verdict === 'OK') {
      solvedProblems.add(`${submission.problem.contestId}${submission.problem.index}`);
      const rating = submission.problem.rating || 'Unrated';
      problemsByRating[rating] = (problemsByRating[rating] || 0) + 1;
    }
  });

  return {
    handle,
    totalSolved: solvedProblems.size,
    totalSubmissions: submissions.length,
    totalContests: contests.length,
    problemsByRating,
    submissions,
    contests,
  };
};