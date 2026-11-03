import React from 'react';
import { VideoItem, ContestStatus } from '../types/contest';
import { Award, Eye, Heart, Clock } from 'lucide-react';

interface LeaderboardPodiumProps {
  videos: VideoItem[];
  contestStatus: ContestStatus;
  onSelectVideo: (video: VideoItem) => void;
  onVote: (video: VideoItem) => void;
  hasUserVotedFor: (videoId: string) => boolean;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({
  videos,
  contestStatus,
  onSelectVideo,
  onVote,
  hasUserVotedFor
}) => {
  const sorted = [...videos].sort((a, b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((sum, v) => sum + v.votes, 0) || 1;
  const topThree = sorted.slice(0, 3);

  if (topThree.length === 0) return null;

  const podiumOrder = [
    topThree[1], // 2nd Place (Left)
    topThree[0], // 1st Place (Center)
    topThree[2], // 3rd Place (Right)
  ].filter(Boolean);

  const getRankMeta = (item: VideoItem) => {
    if (item.id === topThree[0]?.id) {
      return {
        rank: 1,
        title: contestStatus === 'ended' ? 'QUÁN QUÂN CHUNG CUỘC' : 'QUÁN QUÂN',
        medal: '🥇',
        badgeColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
        podiumHeight: 'h-64 sm:h-72',
        borderGlow: 'border-amber-400 dark:border-amber-500 shadow-md shadow-amber-500/10'
      };
    }
    if (item.id === topThree[1]?.id) {
      return {
        rank: 2,
        title: contestStatus === 'ended' ? 'Á QUÂN 1 CHUNG CUỘC' : 'Á QUÂN 1',
        medal: '🥈',
        badgeColor: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
        podiumHeight: 'h-52 sm:h-60',
        borderGlow: 'border-slate-300 dark:border-slate-700'
      };
    }
    return {
      rank: 3,
      title: contestStatus === 'ended' ? 'Á QUÂN 2 CHUNG CUỘC' : 'Á QUÂN 2',
      medal: '🥉',
      badgeColor: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/40',
      podiumHeight: 'h-44 sm:h-52',
      borderGlow: 'border-amber-600/40 dark:border-amber-800/40'
    };
  };

  return (
    <section id="leaderboard" className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>
              {contestStatus === 'ended'
                ? 'TOP 3 VINH DANH CHUNG CUỘC'
                : 'TOP 3 DẪN ĐẦU BÌNH CHỌN'}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {contestStatus === 'ended'
              ? 'Bảng Xếp Hạng Kết Quả Chung Cuộc'
              : 'Bảng Xếp Hạng Trực Tiếp'}
          </h2>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {contestStatus === 'ended'
            ? 'Kết quả đã được chốt chính thức sau khi hết thời gian bình chọn'
            : 'Tự động đồng bộ và cập nhật theo từng lượt bình chọn'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
        {podiumOrder.map((item) => {
          const meta = getRankMeta(item);
          const pct = ((item.votes / totalVotes) * 100).toFixed(1);
          const isVoted = hasUserVotedFor(item.id);
          const isVoteDisabled = contestStatus !== 'active' || isVoted;

          return (
            <div
              key={item.id}
              className={`relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border ${meta.borderGlow} transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Rank Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl" role="img" aria-label={meta.title}>
                    {meta.medal}
                  </span>
                  <span className="text-xs font-bold tracking-wide uppercase text-slate-800 dark:text-slate-200">
                    {meta.title}
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                  {item.code}
                </span>
              </div>

              {/* Creator info */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={item.authorAvatar || '/src/assets/images/creator_avatar_female_1793708279614.jpg'}
                  alt={item.author}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="overflow-hidden">
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Tác giả: {item.author}
                  </div>
                  <h3
                    className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-blue-600 cursor-pointer"
                    onClick={() => onSelectVideo(item)}
                  >
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Vote Count & Visual Progress */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl mb-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                    {item.votes.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {pct}% tổng phiếu
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      meta.rank === 1 ? 'bg-amber-500' : meta.rank === 2 ? 'bg-slate-400' : 'bg-amber-600'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, (item.votes / (topThree[0]?.votes || 1)) * 100)
                      )}%`
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectVideo(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => onVote(item)}
                  disabled={isVoteDisabled}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    contestStatus === 'upcoming'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 cursor-not-allowed'
                      : contestStatus === 'ended'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : isVoted
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm cursor-pointer'
                  }`}
                >
                  {contestStatus === 'upcoming' ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isVoted ? 'fill-emerald-600 text-emerald-600' : ''
                      }`}
                    />
                  )}
                  <span>
                    {contestStatus === 'upcoming'
                      ? 'Sắp mở'
                      : contestStatus === 'ended'
                      ? 'Đã kết thúc'
                      : isVoted
                      ? 'Đã Vote'
                      : 'Bình Chọn'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
