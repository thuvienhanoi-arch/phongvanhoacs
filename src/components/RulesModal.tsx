import React from 'react';
import { ContestConfig } from '../types/contest';
import { X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ContestConfig;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Thể Lệ & Quy Định Bình Chọn
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Công khai, minh bạch và chống gian lận
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6 text-sm text-slate-700 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200">
            <strong>Mục tiêu:</strong> Tạo sân chơi văn minh, lành mạnh để khán giả Facebook cùng lan tỏa và tôn vinh những tác phẩm video giàu giá trị nhân văn và sáng tạo.
          </div>

          <div className="space-y-3">
            {config.rules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {rule}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Cơ chế phát hiện gian lận:</span>
              Mọi hành vi sử dụng công cụ auto-click, clone bot Facebook hoặc mua bán phiếu bình chọn nếu bị phát hiện sẽ bị ban tổ chức hủy tư cách dự thi ngay lập tức mà không cần báo trước.
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
          >
            Tôi Đã Hiểu Rõ
          </button>
        </div>
      </div>
    </div>
  );
};
