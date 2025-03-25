export interface Problem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating: number;
  tags: string[];
}

export interface Submission {
  id: number;
  contestId: number;
  problem: Problem;
  verdict: string;
  creationTimeSeconds: number;
}

export interface Contest {
  id: number;
  contestId?: number;
  name: string;
  contestName?: string;
  type: string;
  phase: string;
  startTimeSeconds: number;
  rank?: number;
  oldRating?: number;
  newRating?: number;
}

export interface UserStats {
  handle: string;
  totalSolved: number;
  totalSubmissions: number;
  totalContests: number;
  problemsByRating: { [key: string]: number };
  submissions: Submission[];
  contests: Contest[];
  activityData: Array<{ date: string; count: number }>;
}

export interface ActivityData {
  date: string;
  count: number;
}