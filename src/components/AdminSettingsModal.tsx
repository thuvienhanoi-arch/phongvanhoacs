import React, { useState } from 'react';
import { ContestConfig, VideoItem, getContestStatus } from '../types/contest';
import { X, Shield, RefreshCw, Trash2, RotateCcw, Clock, AlertTriangle } from 'lucide-react';
import { INITIAL_VIDEOS, resetContestVotes, saveVideos } from '../utils/storage';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ContestConfig;
  onSaveConfig: (config: ContestConfig) => void;
  videos: VideoItem[];
  onUpdateVideos: (videos: VideoItem[]) => void;
  onToast: (msg: string) => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  videos,
  onUpdateVideos,
  onToast
}) => {
  const [formData, setFormData] = useState<ContestConfig>({ ...config });
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentStatus = getContestStatus(formData.startDate, formData.endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(formData.startDate).getTime();
    const end = new Date(formData.endDate).getTime();

    if (isNaN(start) || isNaN(end)) {
      setDateError('Thời gian bắt đầu hoặc kết thúc không hợp lệ.');
      return;
    }

    if (end <= start) {
      setDateError('Thời gian kết thúc phải diễn ra SAU thời gian bắt đầu bình chọn.');
      return;
    }

    setDateError(null);
    onSaveConfig(formData);
    onToast('Đã lưu cấu hình cuộc thi thành công!');
    onClose();
  };

  // Quick Presets
  const applyPreset = (preset: 'active7d' | 'endNow' | 'upcoming24h') => {
    const now = Date.now();
    if (preset === 'active7d') {
      const start = new Date(now - 1000 * 60 * 30).toISOString(); // started 30 mins ago
      const end = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
      setFormData({ ...formData, startDate: start, endDate: end });
      setDateError(null);
      onToast('Đã áp dụng: Cuộc thi Đang Mở (kéo dài 7 ngày)');
    } else if (preset === 'endNow') {
      const start = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      const end = new Date(now - 1000 * 60 * 2).toISOString(); // ended 2 mins ago
      setFormData({ ...formData, startDate: start, endDate: end });
      setDateError(null);
      onToast('Đã áp dụng: Cuộc thi Đã Kết Thúc (Xem bảng vinh danh chung cuộc)');
    } else if (preset === 'upcoming24h') {
      const start = new Date(now + 24 * 60 * 60 * 1000).toISOString(); // starts tomorrow
      const end = new Date(now + 8 * 24 * 60 * 60 * 1000).toISOString();
      setFormData({ ...formData, startDate: start, endDate: end });
      setDateError(null);
      onToast('Đã áp dụng: Cuộc thi Sắp Diễn Ra (Mở sau 24h)');
    }
  };

  const handleResetVotes = () => {
    const updated = resetContestVotes();
    onUpdateVideos(updated);
    setShowConfirmReset(false);
    onToast('Đã đặt lại toàn bộ lượt bình chọn về 0!');
  };

  const handleRestoreDefaults = () => {
    saveVideos(INITIAL_VIDEOS);
    onUpdateVideos(INITIAL_VIDEOS);
    onToast('Đã khôi phục danh sách video mẫu ban đầu!');
  };

  const handleDeleteVideo = (id: string, title: string) => {
    const filtered = videos.filter((v) => v.id !== id);
    saveVideos(filtered);
    onUpdateVideos(filtered);
    onToast(`Đã xóa video "${title}" khỏi danh sách!`);
  };

  // Format datetime-local string (YYYY-MM-DDTHH:mm)
  const toLocalInputValue = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Cài Đặt & Quản Lý Cuộc Thi
              </h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                currentStatus === 'active'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : currentStatus === 'upcoming'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
              }`}>
                {currentStatus === 'active' ? 'Đang mở vote' : currentStatus === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Điều chỉnh thời gian bắt đầu & kết thúc, thể lệ và danh sách tác phẩm
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Contest Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tiêu đề cuộc thi *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mô tả ngắn cuộc thi
            </label>
            <textarea
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Start and End Date & Time Configuration */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Thời Gian Mở & Đóng Bình Chọn (Bắt buộc)</span>
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 mb-3">
              Nút bình chọn chỉ được kích hoạt trong khoảng thời gian này. Khi hết hạn, hệ thống tự động khóa bình chọn và chốt bảng kết quả chung cuộc.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Thời điểm Bắt Đầu Bình Chọn *
                </label>
                <input
                  type="datetime-local"
                  value={toLocalInputValue(formData.startDate)}
                  onChange={(e) => {
                    const iso = new Date(e.target.value).toISOString();
                    setFormData({ ...formData, startDate: iso });
                  }}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Thời điểm Kết Thúc Bình Chọn *
                </label>
                <input
                  type="datetime-local"
                  value={toLocalInputValue(formData.endDate)}
                  onChange={(e) => {
                    const iso = new Date(e.target.value).toISOString();
                    setFormData({ ...formData, endDate: iso, deadline: iso });
                  }}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {dateError && (
              <div className="mt-2.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{dateError}</span>
              </div>
            )}

            {/* Quick Presets */}
            <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-blue-900/60 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Chọn nhanh:</span>
              <button
                type="button"
                onClick={() => applyPreset('active7d')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Đang Mở (7 Ngày)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('endNow')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800/60 hover:bg-rose-50 text-rose-700 dark:text-rose-400 cursor-pointer"
              >
                Kết Thúc Ngay (Xem Kết Quả)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('upcoming24h')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800/60 hover:bg-amber-50 text-amber-700 dark:text-amber-400 cursor-pointer"
              >
                Sắp Diễn Ra (Mở sau 24h)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tên Fanpage chính thức
              </label>
              <input
                type="text"
                value={formData.fanpageName}
                onChange={(e) => setFormData({ ...formData, fanpageName: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Link Fanpage Facebook
              </label>
              <input
                type="text"
                value={formData.fanpageUrl}
                onChange={(e) => setFormData({ ...formData, fanpageUrl: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireFanpageFollow}
                onChange={(e) => setFormData({ ...formData, requireFanpageFollow: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Bắt buộc Follow Fanpage trước khi Vote (Chống gian lận)
              </span>
            </label>
          </div>

          {/* Video Management List */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Danh sách tác phẩm ({videos.length} video)
              </h4>
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Nạp lại 5 video mẫu</span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div className="truncate max-w-[400px]">
                    <span className="font-mono font-bold text-slate-500 mr-2">{vid.code}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{vid.title}</span>
                    <span className="text-slate-400"> ({vid.votes} vote)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(vid.id, vid.title)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Votes Danger Zone */}
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-red-900 dark:text-red-300">Đặt Lại Toàn Bộ Phiếu Bình Chọn</div>
                <div className="text-[11px] text-red-700 dark:text-red-400">
                  Xóa tất cả số lượt vote hiện tại về 0 cho tất cả tác phẩm
                </div>
              </div>

              {showConfirmReset ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetVotes}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Xác nhận Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="px-2 py-1 text-xs text-slate-600"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Phiếu</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
