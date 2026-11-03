import React, { useState } from 'react';
import { VoterProfile, ContestConfig } from '../types/contest';
import { X, CheckCircle2, ShieldCheck, ExternalLink, Facebook } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ContestConfig;
  currentVoter: VoterProfile | null;
  onSaveVoter: (voter: VoterProfile) => void;
  onToast: (msg: string) => void;
  pendingVoteVideoTitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  config,
  currentVoter,
  onSaveVoter,
  onToast,
  pendingVoteVideoTitle
}) => {
  const [userName, setUserName] = useState(currentVoter?.name || 'Khán giả Facebook');
  const [fbId, setFbId] = useState(
    currentVoter?.fbId || `fb_usr_${Math.floor(10000000 + Math.random() * 90000000)}`
  );
  const [step, setStep] = useState<1 | 2>(currentVoter ? 2 : 1);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleFacebookLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      onToast('Vui lòng nhập tên của bạn');
      return;
    }

    const voter: VoterProfile = {
      id: currentVoter?.id || `voter-${Date.now()}`,
      name: userName.trim(),
      fbId: fbId.trim() || `fb_${Date.now()}`,
      avatarUrl:
        currentVoter?.avatarUrl ||
        '/src/assets/images/creator_avatar_female_1793708279614.jpg',
      hasFollowedFanpage: currentVoter?.hasFollowedFanpage || false,
      votedVideoIds: currentVoter?.votedVideoIds || []
    };

    onSaveVoter(voter);
    setStep(2);
    onToast(`Đã kết nối tài khoản "${voter.name}"!`);
  };

  const handleVerifyFollow = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (currentVoter) {
        const updated: VoterProfile = {
          ...currentVoter,
          hasFollowedFanpage: true
        };
        onSaveVoter(updated);
        onToast('Xác nhận thành công! Bạn đã mở khóa tính năng Bình Chọn.');
        onClose();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Facebook className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Xác Thực Tài Khoản Bình Chọn
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chống gian lận · Đảm bảo công bằng cho tất cả các tác phẩm
            </p>
          </div>
        </div>

        {pendingVoteVideoTitle && (
          <div className="mb-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300">
            Bạn đang chuẩn bị bình chọn cho: <span className="font-bold">{pendingVoteVideoTitle}</span>
          </div>
        )}

        {/* Step Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              step === 1
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1. Đăng nhập Facebook
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!currentVoter}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              step === 2
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            2. Follow Fanpage
          </button>
        </div>

        {/* STEP 1: Facebook Login */}
        {step === 1 && (
          <form onSubmit={handleFacebookLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tên hiển thị người bình chọn
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Facebook User ID (Dùng để xác thực 1 lượt vote duy nhất)
              </label>
              <input
                type="text"
                value={fbId}
                onChange={(e) => setFbId(e.target.value)}
                placeholder="fb_user_12345678"
                required
                className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Quy định bảo mật & công bằng</span>
              </div>
              <p>Mỗi tài khoản Facebook chỉ được ghi nhận tối đa {config.maxVotesPerUser} lượt bình chọn hợp lệ.</p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Facebook className="w-4 h-4 fill-white" />
              <span>Tiếp tục với tài khoản Facebook</span>
            </button>
          </form>
        )}

        {/* STEP 2: Follow Fanpage */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-center">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">
                Theo Dõi Fanpage Ban Tổ Chức
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                Vui lòng nhấn nút theo dõi Fanpage để mở khóa lượt bình chọn của bạn
              </p>

              {/* Fanpage Card Preview */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 text-left">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {config.fanpageName}
                  </div>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    Trang chính thức
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {config.fanpageFollowers}
                </div>

                <a
                  href={config.fanpageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <span>Mở Fanpage trên Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Follow Status */}
              {currentVoter?.hasFollowedFanpage ? (
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bạn đã xác nhận Follow Fanpage thành công!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyFollow}
                  disabled={isVerifying}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isVerifying ? 'Đang xác thực...' : 'Tôi đã Follow Fanpage · Mở khóa Vote'}</span>
                </button>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
