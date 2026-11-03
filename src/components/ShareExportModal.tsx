import React, { useState } from 'react';
import { ContestConfig, VideoItem, getContestStatus } from '../types/contest';
import { exportLeaderboardImage, exportContestCSV } from '../utils/exportImage';
import { getFacebookShareUrl } from '../utils/facebook';
import {
  X,
  Share2,
  Image,
  FileSpreadsheet,
  Copy,
  Check,
  Facebook,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface ShareExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ContestConfig;
  videos: VideoItem[];
  onToast: (msg: string) => void;
}

export const ShareExportModal: React.FC<ShareExportModalProps> = ({
  isOpen,
  onClose,
  config,
  videos,
  onToast
}) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [targetFanpageUrl, setTargetFanpageUrl] = useState(config.fanpageUrl);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://facebook.com';
  const status = getContestStatus(config.startDate, config.endDate);

  const sorted = [...videos].sort((a, b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((sum, v) => sum + v.votes, 0) || 1;
  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];

  // Rich formatted Facebook post summary caption
  const statusLabel =
    status === 'ended'
      ? '🏆 KẾT QUẢ CHUNG CUỘC CHÍNH THỨC'
      : status === 'upcoming'
      ? '📢 SẮP MỞ CỔNG BÌNH CHỌN'
      : '🔥 BẢNG XẾP HẠNG BÌNH CHỌN TRỰC TIẾP';

  const postSummary = `${statusLabel}: ${config.title}
----------------------------------------
${top1 ? `🥇 Quán quân: ${top1.title} - ${top1.author} (${top1.votes} phiếu - ${((top1.votes / totalVotes) * 100).toFixed(1)}%)` : ''}
${top2 ? `🥈 Á quân 1: ${top2.title} - ${top2.author} (${top2.votes} phiếu - ${((top2.votes / totalVotes) * 100).toFixed(1)}%)` : ''}
${top3 ? `🥉 Á quân 2: ${top3.title} - ${top3.author} (${top3.votes} phiếu - ${((top3.votes / totalVotes) * 100).toFixed(1)}%)` : ''}
📊 Tổng số lượt bình chọn: ${totalVotes.toLocaleString('vi-VN')} phiếu
👉 Khám phá và bình chọn ngay tại: ${currentUrl}
#FacebookVideoAwards #BinhChonVideo #SangTao2026`;

  // Share to Facebook Profile / Feed
  const handleShareFacebookProfile = () => {
    const quote = `${statusLabel}: ${config.title}. ${
      top1 ? `Dẫn đầu: "${top1.title}" (${top1.votes} vote)!` : ''
    } Hãy cùng bình chọn ngay!`;
    const shareUrl = getFacebookShareUrl(currentUrl, quote);
    window.open(shareUrl, '_blank', 'width=650,height=550');
    onToast('Đã mở hộp thoại chia sẻ lên Facebook!');
  };

  // Share to Fanpage or Group
  const handleShareToFanpage = () => {
    // Copy the summary caption automatically to clipboard so the user can easily paste it into their Fanpage post
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postSummary);
    }
    window.open(targetFanpageUrl, '_blank');
    onToast('Đã sao chép nội dung bài viết và mở trang Fanpage Facebook!');
  };

  // Copy Caption
  const handleCopyCaption = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postSummary);
      setCopiedCaption(true);
      onToast('Đã sao chép toàn bộ tóm tắt kết quả vào bộ nhớ đệm!');
      setTimeout(() => setCopiedCaption(false), 2500);
    }
  };

  // Export Infographic Image
  const handleExportImage = async () => {
    setIsGeneratingImage(true);
    try {
      await exportLeaderboardImage(config, videos);
      onToast('Đã tạo và tải ảnh Bảng Vinh Danh kết quả thành công!');
    } catch (err) {
      console.error(err);
      onToast('Có lỗi khi tạo ảnh');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      exportContestCSV(config, videos);
      onToast('Đã tải tệp báo cáo kết quả (CSV/Excel) thành công!');
    } catch (err) {
      console.error(err);
      onToast('Có lỗi khi xuất file CSV');
    }
  };

  // Copy app link
  const handleCopyContestLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      onToast('Đã sao chép liên kết trang bình chọn!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Xuất & Chia Sẻ Kết Quả Về Facebook
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chia sẻ kết quả trực tiếp lên trang cá nhân Facebook hoặc Fanpage cộng đồng
            </p>
          </div>
        </div>

        {/* Live Summary Snippet Preview Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>Nội dung bài viết Facebook (kèm tóm tắt kết quả):</span>
            </span>
            <button
              type="button"
              onClick={handleCopyCaption}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCaption ? 'Đã sao chép' : 'Sao chép văn bản'}</span>
            </button>
          </div>

          <pre className="text-xs font-sans text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
            {postSummary}
          </pre>
        </div>

        {/* Options Grid */}
        <div className="space-y-3 mb-6">
          {/* Action 1: Direct Share to Facebook Profile */}
          <button
            type="button"
            onClick={handleShareFacebookProfile}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Facebook className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  1. Chia Sẻ Lên Facebook Cá Nhân / Dòng Thời Gian
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Mở hộp thoại đăng bài Facebook kèm link bình chọn và tóm tắt kết quả
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          {/* Action 2: Share to Specific Fanpage */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                2. Đăng Lên Fanpage / Nhóm Facebook Chỉ Định
              </div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Tự động copy văn bản
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={targetFanpageUrl}
                onChange={(e) => setTargetFanpageUrl(e.target.value)}
                placeholder="https://www.facebook.com/your-fanpage"
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleShareToFanpage}
                className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Mở Trang</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action 3: Export Leaderboard Image */}
          <button
            type="button"
            onClick={handleExportImage}
            disabled={isGeneratingImage}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  3. Xuất Ảnh Bảng Vinh Danh (PNG 1200x675)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Tải ảnh đồ họa Infographic chuẩn tỉ lệ bài đăng Facebook chất lượng cao
                </div>
              </div>
            </div>
            {isGeneratingImage && <span className="text-xs text-amber-500 font-semibold">Đang xuất...</span>}
          </button>

          {/* Action 4: Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  4. Xuất Báo Cáo Xếp Hạng Đầy Đủ (CSV / Excel)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Bảng tổng hợp xếp hạng, số phiếu, tỷ lệ % và link Facebook của từng video
                </div>
              </div>
            </div>
          </button>

          {/* Action 5: Copy Link */}
          <button
            type="button"
            onClick={handleCopyContestLink}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                {copiedLink ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  5. Sao Chép Đường Dẫn Ứng Dụng Bình Chọn
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs">
                  {currentUrl}
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
