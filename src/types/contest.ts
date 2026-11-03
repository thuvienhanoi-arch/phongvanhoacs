export interface VideoItem {
  id: string;
  code: string; // SBD: e.g. "SBD 01"
  title: string;
  author: string;
  description?: string;
  fbUrl: string;
  embedUrl: string;
  thumbnailUrl?: string;
  authorAvatar?: string;
  votes: number;
  createdAt: number;
  tags?: string[];
}

export interface VoterProfile {
  id: string;
  name: string;
  fbId: string;
  avatarUrl: string;
  hasFollowedFanpage: boolean;
  votedVideoIds: string[]; // List of video IDs this user has voted for
  lastVotedAt?: number;
}

export interface ContestConfig {
  title: string;
  subtitle: string;
  fanpageUrl: string;
  fanpageName: string;
  fanpageFollowers: string;
  startDate: string; // ISO date string e.g. "2026-11-03T00:00:00.000Z"
  endDate: string; // ISO date string e.g. "2026-11-10T23:59:59.000Z"
  deadline?: string; // backwards compatibility alias for endDate
  maxVotesPerUser: number; // usually 1
  requireFanpageFollow: boolean;
  allowPublicSubmit: boolean;
  rules: string[];
}

export type ContestStatus = 'upcoming' | 'active' | 'ended';

export type SortMode = 'votes' | 'code' | 'newest' | 'author';

export function getContestStatus(startDateStr: string, endDateStr: string): ContestStatus {
  const now = Date.now();
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();

  if (now < start) {
    return 'upcoming';
  }
  if (now > end) {
    return 'ended';
  }
  return 'active';
}
