import React, { useState, useRef } from 'react';
import { VideoItem } from '../types/contest';
import { parseVideoUrl } from '../utils/facebook';
import { createVideo, bulkCreateVideos } from '../utils/storage';
import { X, Link2, UploadCloud, Check, FileText, Download, Trash2, AlertCircle } from 'lucide-react';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (videos: VideoItem[]) => void;
  onToast: (msg: string) => void;
}

interface ParsedBulkItem {
  id: string;
  title: string;
  author: string;
  url: string;
  description: string;
  isValid: boolean;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  isOpen,
  onClose,
  onAdded,
  onToast
}) => {
  const [tab, setTab] = useState<'single' | 'bulk'>('single');

  // Single Video Form state
  const [fbUrl, setFbUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{ isValid: boolean; embedUrl: string } | null>(null);

  // Bulk Import state
  const [bulkText, setBulkText] = useState('');
  const [parsedBulkItems, setParsedBulkItems] = useState<ParsedBulkItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Real-time link validator and preview generator
  const handleUrlChange = (url: string) => {
    setFbUrl(url);
    if (!url.trim()) {
      setParsedPreview(null);
      return;
    }
    const res = parseVideoUrl(url);
    setParsedPreview({ isValid: res.isValid, embedUrl: res.embedUrl });
  };

  // Submit single video
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbUrl.trim() || !title.trim()) {
      onToast('Vui lòng điền đầy đủ link video Facebook và tiêu đề');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newVid = createVideo({
      title,
      author: author.trim() || 'Thí sinh tự do',
      fbUrl,
      description,
      tags: tags.length > 0 ? tags : ['Facebook Video']
    });

    onAdded([newVid]);
    onToast(`Đã thêm thành công tác phẩm "${newVid.title}" (${newVid.code}) vào danh sách bình chọn!`);
    onClose();

    // Reset single form
    setFbUrl('');
    setTitle('');
    setAuthor('');
    setDescription('');
    setTagsInput('');
    setParsedPreview(null);
  };

  // Parse lines from raw string (CSV, TSV, or Pipe delimited)
  const parseRawContent = (content: string) => {
    const rawLines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (rawLines.length === 0) {
      setParsedBulkItems([]);
      return;
    }

    // Check if line 1 is header
    const firstLine = rawLines[0].toLowerCase();
    const isHeader =
      firstLine.includes('tiêu đề') ||
      firstLine.includes('tên') ||
      firstLine.includes('title') ||
      firstLine.includes('link') ||
      firstLine.includes('url');

    const linesToProcess = isHeader ? rawLines.slice(1) : rawLines;

    const items: ParsedBulkItem[] = linesToProcess.map((line, idx) => {
      // Split by pipe | or comma or tab or semicolon
      let parts: string[] = [];
      if (line.includes('|')) {
        parts = line.split('|').map((p) => p.trim());
      } else if (line.includes('\t')) {
        parts = line.split('\t').map((p) => p.trim());
      } else if (line.includes(';')) {
        parts = line.split(';').map((p) => p.trim());
      } else {
        // CSV with possible quotes handling
        parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      }

      // Detect which column is the Facebook URL
      let url = '';
      let itemTitle = '';
      let itemAuthor = '';
      let itemDesc = '';

      const urlIndex = parts.findIndex((p) => /(facebook\.com|fb\.watch|youtu|http)/i.test(p));

      if (urlIndex !== -1) {
        url = parts[urlIndex];
        const remaining = parts.filter((_, i) => i !== urlIndex);
        itemTitle = remaining[0] || `Video dự thi số ${idx + 1}`;
        itemAuthor = remaining[1] || 'Thí sinh';
        itemDesc = remaining[2] || '';
      } else {
        // Fallback default column order: Title, Author, URL, Desc
        itemTitle = parts[0] || `Video dự thi số ${idx + 1}`;
        itemAuthor = parts[1] || 'Thí sinh';
        url = parts[2] || '';
        itemDesc = parts[3] || '';
      }

      const isValid = parseVideoUrl(url).isValid;

      return {
        id: `bulk-${idx}-${Date.now()}`,
        title: itemTitle,
        author: itemAuthor,
        url,
        description: itemDesc,
        isValid
      };
    });

    setParsedBulkItems(items);
  };

  const handleBulkTextChange = (text: string) => {
    setBulkText(text);
    parseRawContent(text);
  };

  // Handle file reader
  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            const formatted = json
              .map(
                (item) =>
                  `${item.title || ''} | ${item.author || ''} | ${item.fbUrl || item.url || ''} | ${
                    item.description || ''
                  }`
              )
              .join('\n');
            setBulkText(formatted);
            parseRawContent(formatted);
            onToast(`Đã đọc ${json.length} mục từ tệp JSON`);
          }
        } catch {
          onToast('Tệp JSON không đúng định dạng');
        }
      } else {
        setBulkText(text);
        parseRawContent(text);
        onToast(`Đã tải tệp "${file.name}"`);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  // Delete item from parsed preview
  const handleRemoveParsedItem = (id: string) => {
    setParsedBulkItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Submit bulk items
  const handleBulkSubmit = () => {
    const validItems = parsedBulkItems.filter((i) => i.isValid && i.title.trim());
    if (validItems.length === 0) {
      onToast('Không tìm thấy link video hợp lệ nào trong danh sách');
      return;
    }

    const payload = validItems.map((item) => ({
      title: item.title,
      author: item.author,
      fbUrl: item.url,
      description: item.description,
      tags: ['Nhập danh sách']
    }));

    const updatedList = bulkCreateVideos(payload);
    onAdded(updatedList);
    onToast(`Đã thêm thành công ${validItems.length} video vào cuộc thi!`);
    onClose();

    // Reset
    setBulkText('');
    setParsedBulkItems([]);
  };

  const handleDownloadSample = () => {
    const sample = `Tiêu đề | Tác giả | Link Facebook Video | Mô tả
Phim Ngắn: Bình Minh Đảo Xa | Vũ Hoàng Nam | https://www.facebook.com/watch/?v=10153231379946729 | Thước phim tài liệu về biển đảo
Vũ Điệu Tuổi Trẻ Sài Gòn | Nhóm FreeStep | https://www.facebook.com/watch/?v=10153231379946730 | Tiết mục nhảy hiện đại
Ẩm Thực Chợ Lớn Nét Đẹp Nghìn Năm | Food Reviewer Minh | https://www.facebook.com/watch/?v=10153231379946731 | Khám phá văn hóa ẩm thực`;
    const blob = new Blob(['\uFEFF' + sample], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'danh_sach_video_mau.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedBulkItems.filter((i) => i.isValid).length;

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
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            Thêm Video Dự Thi Bình Chọn
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dán đường dẫn video Facebook trực tiếp hoặc tải lên tệp danh sách video (CSV, TXT, JSON)
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setTab('single')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tab === 'single'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>1. Dán Link Facebook Trực Tiếp</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('bulk')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tab === 'bulk'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>2. Tải Lên Danh Sách Tệp (CSV / TXT)</span>
          </button>
        </div>

        {/* TAB 1: Single Link */}
        {tab === 'single' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Đường dẫn Video Facebook (Facebook URL) *
              </label>
              <input
                type="text"
                value={fbUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.facebook.com/.../videos/... hoặc https://fb.watch/..."
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Hỗ trợ: Facebook Video, Watch, Reels, fb.watch hoặc YouTube URL
              </span>
            </div>

            {/* Video Preview if valid */}
            {parsedPreview && (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
                <div className="p-2 text-xs font-semibold text-slate-300 bg-slate-900 flex items-center justify-between">
                  <span>Trình phát xem trước</span>
                  {parsedPreview.isValid ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Nhận diện video thành công
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Link chưa đúng định dạng
                    </span>
                  )}
                </div>
                {parsedPreview.isValid && parsedPreview.embedUrl && (
                  <div className="aspect-video w-full">
                    <iframe
                      src={parsedPreview.embedUrl}
                      title="Preview"
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên / Tiêu đề tác phẩm *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Phim ngắn Mùa Gặt Quê Hương"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tác giả / Thí sinh / Đội thi
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A (Ekip Flycam)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mô tả ngắn về video
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Giới thiệu nội dung, thông điệp truyền tải..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Thẻ chủ đề (cách nhau bởi dấu phẩy)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Du lịch, Nghệ thuật, Cảm động"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Thêm Vào Danh Sách Bình Chọn
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Bulk Upload & Import */}
        {tab === 'bulk' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Nhập danh sách: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">Tiêu đề | Tác giả | Link Facebook</code>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp mẫu CSV</span>
              </button>
            </div>

            {/* Drag & Drop File Upload Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-colors cursor-pointer ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40'
              }`}
            >
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Kéo thả tệp CSV / TXT / JSON vào đây hoặc bấm để chọn tệp
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Hệ thống tự động đọc và trích xuất danh sách video
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.json"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Or Paste Raw Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Hoặc dán nội dung danh sách trực tiếp:
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => handleBulkTextChange(e.target.value)}
                rows={4}
                placeholder="Phim ngắn Mùa Gặt | Nguyễn Văn A | https://facebook.com/watch/?v=10153231379946729&#10;Vũ Điệu Nón Lá | Nhóm D-Soul | https://facebook.com/watch/?v=10153231379946730"
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Parsed List Preview Table */}
            {parsedBulkItems.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 max-h-56 overflow-y-auto">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center justify-between">
                  <span>Xem trước danh sách ({parsedBulkItems.length} mục)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ {validCount} video hợp lệ
                  </span>
                </div>

                <div className="space-y-2">
                  {parsedBulkItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="text-xs flex items-center justify-between gap-3 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="truncate flex-1">
                        <span className="font-mono text-slate-400 mr-1.5">#{idx + 1}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                        <span className="text-slate-400"> · {item.author}</span>
                        <div className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                          {item.url}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.isValid ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            Hợp lệ
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                            Sai link
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveParsedItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={validCount === 0}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Nhập Tất Cả Vào Cuộc Thi ({validCount} video)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
