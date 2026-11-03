import React from 'react';
import { VideoItem, ContestStatus } from '../types/contest';
import { X, Heart, ExternalLink, Share2, Clock, Check } from 'lucide-react';
import { getFacebookShareUrl } from '../utils/facebook';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  contestStatus: ContestStatus;
  onClose: () => void;
  onVote: (video: VideoItem) => void;
  hasUserVoted: boolean;
  onToast: (msg: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  contestStatus,
  onClose,
  onVote,
  hasUserVoted,
  onToast
}) => {
  if (!video) return null;

  const isVoteDisabled = contestStatus !== 'active' || hasUserVoted;

  const getVoteButtonLabel = () => {
    if (contestStatus === 'upcoming') return 'Chưa Mở Bình Chọn';
    if (contestStatus === 'ended') return 'Bình Chọn Đã Kết Thúc';
    if (hasUserVoted) return 'Đã Bình Chọn';
    return 'Bình Chọn Cho Video Này';
  };

  const handleShareFacebook = () => {
    const shareUrl = getFacebookShareUrl(
      video.fbUrl,
      `🔥 Bình chọn cho tác phẩm "${video.title}" (${video.code}) trong Cuộc thi Video Facebook!`
    );
    window.open(shareUrl, '_blank', 'width=650,height=550');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(video.fbUrl);
      onToast(`Đã sao chép link video (${video.code})!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-bold font-mono text-white bg-blue-600 rounded-md">
              {video.code}
            </span>
            <h3 className="text-base font-bold text-white truncate max-w-md sm:max-w-xl">
              {video.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={video.embedUrl}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Info & Action Footer */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-y-auto">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img
                src={video.authorAvatar || '/src/assets/images/creator_avatar_male_1793708281689.jpg'}
                alt={video.author}
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
              <div>
                <span className="text-xs text-slate-400">Tác giả / Thí sinh:</span>
                <div className="text-sm font-semibold text-white">{video.author}</div>
              </div>
            </div>

            {video.description && (
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
                {video.description}
              </p>
            )}
          </div>

          {/* Right Action Block */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right mr-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                {contestStatus === 'ended' ? 'Phiếu chung cuộc' : 'Lượt bình chọn'}
              </div>
              <div className="text-2xl font-extrabold font-mono text-white tabular-nums">
                {video.votes.toLocaleString('vi-VN')}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              title="Sao chép link"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <a
              href={video.fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Mở trên Facebook"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => onVote(video)}
              disabled={isVoteDisabled}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all ${
                contestStatus === 'upcoming'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60 cursor-not-allowed'
                  : contestStatus === 'ended'
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : hasUserVoted
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 cursor-pointer'
              }`}
            >
              {contestStatus === 'upcoming' ? (
                <Clock className="w-4 h-4" />
              ) : hasUserVoted ? (
                <Check className="w-4 h-4" />
              ) : (
                <Heart className={`w-4 h-4 ${hasUserVoted ? 'fill-emerald-400' : ''}`} />
              )}
              <span>{getVoteButtonLabel()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
