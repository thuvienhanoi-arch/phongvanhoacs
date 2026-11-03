import { VideoItem, ContestConfig, VoterProfile, getContestStatus } from '../types/contest';
import { parseVideoUrl } from './facebook';

const defaultStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Started 1 day ago
const defaultEnd = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(); // Ends in 6 days

export const INITIAL_CONTEST_CONFIG: ContestConfig = {
  title: 'Cuộc thi trực tuyến “Văn hóa từ mỗi hành động” năm 2026',
  subtitle: 'Lan tỏa hành vi ứng xử đẹp, câu chuyện văn hóa, việc làm tốt và sáng kiến thiết thực; góp phần thực hiện Quy tắc ứng xử, xây dựng Người Hà Nội thanh lịch, văn minh.',
  fanpageUrl: 'https://www.facebook.com/facebookapp',
  fanpageName: 'Xây Dựng Người Hà Nội Thanh Lịch, Văn Minh',
  fanpageFollowers: '420.000+ người theo dõi',
  startDate: defaultStart,
  endDate: defaultEnd,
  deadline: defaultEnd,
  maxVotesPerUser: 1,
  requireFanpageFollow: true,
  allowPublicSubmit: true,
  rules: [
    'Mục tiêu: Lan tỏa hành vi ứng xử đẹp, câu chuyện văn hóa, việc làm tốt và sáng kiến thiết thực, xây dựng Người Hà Nội thanh lịch, văn minh.',
    'Thời gian bình chọn được mở chính thức từ thời điểm Bắt đầu đến thời điểm Kết thúc được ấn định.',
    'Mỗi tài khoản Facebook chỉ được bình chọn 1 lần duy nhất trong suốt thời gian diễn ra cuộc thi.',
    'Khán giả cần thực hiện Follow (Theo dõi) Fanpage chính thức để mở khóa quyền bình chọn.',
    'Sau khi hết thời gian quy định, cổng bình chọn sẽ tự động đóng và kết quả chung cuộc sẽ được chốt chính thức.',
    'Hệ thống tự động phát hiện và loại bỏ các lượt bình chọn ảo hoặc gian lận.'
  ]
};

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    code: 'SBD 01',
    title: 'Nụ Cười Tràng An - Giữ Gìn Nét Đẹp Văn Hóa Ứng Xử Nơi Công Cộng Thủ Đô',
    author: 'Nhóm Tuổi Trẻ Ba Đình',
    authorAvatar: '/src/assets/images/creator_avatar_female_1793708279614.jpg',
    description: 'Thước phim ghi lại những nét đẹp bình dị trong lời ăn tiếng nói, sự nhã nhặn, thân thiện của người dân Hà Nội tại các điểm tham quan di tích và không gian công cộng.',
    fbUrl: 'https://www.facebook.com/facebookapp/videos/10153231379946729/',
    embedUrl: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebookapp%2Fvideos%2F10153231379946729%2F&show_text=false&t=0',
    thumbnailUrl: '/src/assets/images/contest_stage_banner_1793708279116.jpg',
    votes: 438,
    createdAt: Date.now() - 3 * 86400000,
    tags: ['Ứng xử đẹp', 'Tràng An', 'Hà Nội văn minh']
  },
  {
    id: 'vid-2',
    code: 'SBD 02',
    title: 'Hành Động Nhỏ, Ý Nghĩa Lớn: Nhặt Rác Quanh Bờ Hồ Gươm Mỗi Sáng Chủ Nhật',
    author: 'CLB Trẻ Tình Nguyện Thủ Đô Xanh',
    authorAvatar: '/src/assets/images/creator_avatar_male_1793708281689.jpg',
    description: 'Hành trình 3 năm bền bỉ của nhóm thanh niên tình nguyện giữ gìn cảnh quan hồ Hoàn Kiếm, lan tỏa thông điệp giữ sạch môi trường sống đô thị.',
    fbUrl: 'https://www.facebook.com/watch/?v=10153231379946729',
    embedUrl: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebookapp%2Fvideos%2F10153231379946729%2F&show_text=false&t=0',
    thumbnailUrl: '/src/assets/images/contest_stage_banner_1793708279116.jpg',
    votes: 512,
    createdAt: Date.now() - 2 * 86400000,
    tags: ['Hành động đẹp', 'Hồ Gươm', 'Môi trường']
  },
  {
    id: 'vid-3',
    code: 'SBD 03',
    title: 'Chuyện Bác Tổ Trưởng Dân Phố Và Con Đường Hoa Bích Họa Phố Cổ',
    author: 'Đoàn Thanh Niên Phường Hàng Gai',
    authorAvatar: '/src/assets/images/creator_avatar_male_1793708281689.jpg',
    description: 'Sáng kiến cải tạo ngõ nhỏ ẩm thấp thành con đường tranh bích họa tái hiện 36 phố phường, khơi dậy tinh thần gắn kết láng giềng đoàn kết văn hóa.',
    fbUrl: 'https://www.facebook.com/watch/?v=10153231379946730',
    embedUrl: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebookapp%2Fvideos%2F10153231379946729%2F&show_text=false&t=0',
    thumbnailUrl: '/src/assets/images/contest_stage_banner_1793708279116.jpg',
    votes: 367,
    createdAt: Date.now() - 4 * 86400000,
    tags: ['Sáng kiến', 'Phố cổ', 'Đoàn kết']
  },
  {
    id: 'vid-4',
    code: 'SBD 04',
    title: 'Văn Hóa Nhường Ghế Xe Buýt Điện & Nét Đẹp Giao Thông Văn Minh',
    author: 'Nhóm Sinh Viên Đại Học Quốc Gia Hà Nội',
    authorAvatar: '/src/assets/images/creator_avatar_female_1793708279614.jpg',
    description: 'Hình ảnh thanh lịch, văn minh của người trẻ Thủ đô khi đi phương tiện công cộng: xếp hàng trật tự, chủ động nhường ghế cho người già và phụ nữ mang thai.',
    fbUrl: 'https://www.facebook.com/watch/?v=10153231379946731',
    embedUrl: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebookapp%2Fvideos%2F10153231379946729%2F&show_text=false&t=0',
    thumbnailUrl: '/src/assets/images/contest_stage_banner_1793708279116.jpg',
    votes: 421,
    createdAt: Date.now() - 1 * 86400000,
    tags: ['Giao thông', 'Nhường ghế', 'Văn minh']
  },
  {
    id: 'vid-5',
    code: 'SBD 05',
    title: 'Tiếp Nối Nét Thanh Lịch: Lớp Dạy Nếp Sống Tràng An Cho Thế Hệ Măng Non',
    author: 'Cô Giáo Thu Hà & Học Sinh Trường Tiểu Học Thăng Long',
    authorAvatar: '/src/assets/images/creator_avatar_female_1793708279614.jpg',
    description: 'Giáo dục truyền thống hiếu học, lễ phép, nói lời hay làm việc tốt cho học sinh qua các tiết học trải nghiệm thực tế về văn hóa Thăng Long - Hà Nội.',
    fbUrl: 'https://www.facebook.com/watch/?v=10153231379946732',
    embedUrl: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebookapp%2Fvideos%2F10153231379946729%2F&show_text=false&t=0',
    thumbnailUrl: '/src/assets/images/contest_stage_banner_1793708279116.jpg',
    votes: 295,
    createdAt: Date.now() - 5 * 86400000,
    tags: ['Giáo dục', 'Thanh lịch', 'Thăng Long']
  }
];

const STORAGE_KEYS = {
  VIDEOS: 'fb_contest_videos_v4',
  CONFIG: 'fb_contest_config_v4',
  VOTER: 'fb_contest_current_voter_v4',
  ALL_VOTERS: 'fb_contest_registered_voters_v4'
};

// Cross-tab broadcast channel for real-time synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('fb_video_voting_sync');
  }
} catch {
  // sandbox restricted
}

export function subscribeToRealtimeUpdates(callback: (event: { type: string; data?: any }) => void): () => void {
  if (!broadcastChannel) {
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.VIDEOS || e.key === STORAGE_KEYS.CONFIG) {
        callback({ type: 'DATA_UPDATED' });
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => window.removeEventListener('storage', storageHandler);
  }

  const handler = (event: MessageEvent) => {
    callback(event.data);
  };

  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

export function notifyRealtimeUpdate(type: string, data?: any) {
  try {
    broadcastChannel?.postMessage({ type, data, timestamp: Date.now() });
  } catch (err) {
    console.warn('Realtime notify failed:', err);
  }
}

export function loadContestConfig(): ContestConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure startDate and endDate are set
      const startDate = parsed.startDate || defaultStart;
      const endDate = parsed.endDate || parsed.deadline || defaultEnd;
      return {
        ...INITIAL_CONTEST_CONFIG,
        ...parsed,
        startDate,
        endDate,
        deadline: endDate
      };
    }
  } catch {
    // fallback
  }
  return INITIAL_CONTEST_CONFIG;
}

export function saveContestConfig(config: ContestConfig): void {
  try {
    const sanitized = {
      ...config,
      deadline: config.endDate // sync
    };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(sanitized));
    notifyRealtimeUpdate('CONFIG_UPDATED', sanitized);
  } catch (err) {
    console.error('Failed to save config:', err);
  }
}

export function loadVideos(): VideoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (raw) {
      const parsed: VideoItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  saveVideos(INITIAL_VIDEOS);
  return INITIAL_VIDEOS;
}

export function saveVideos(videos: VideoItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    notifyRealtimeUpdate('VIDEOS_UPDATED', videos);
  } catch (err) {
    console.error('Failed to save videos:', err);
  }
}

export function loadCurrentVoter(): VoterProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VOTER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return null;
}

export function saveCurrentVoter(voter: VoterProfile | null): void {
  try {
    if (voter) {
      localStorage.setItem(STORAGE_KEYS.VOTER, JSON.stringify(voter));
      const allRaw = localStorage.getItem(STORAGE_KEYS.ALL_VOTERS);
      const all: Record<string, VoterProfile> = allRaw ? JSON.parse(allRaw) : {};
      all[voter.fbId] = voter;
      localStorage.setItem(STORAGE_KEYS.ALL_VOTERS, JSON.stringify(all));
    } else {
      localStorage.removeItem(STORAGE_KEYS.VOTER);
    }
    notifyRealtimeUpdate('VOTER_UPDATED', voter);
  } catch (err) {
    console.error('Failed to save voter profile:', err);
  }
}

/**
 * Cast a vote with period checks and anti-cheat checks
 */
export function castVote(
  videoId: string,
  voter: VoterProfile,
  config: ContestConfig
): { success: boolean; message: string; updatedVideos?: VideoItem[]; updatedVoter?: VoterProfile } {
  const status = getContestStatus(config.startDate, config.endDate);

  if (status === 'upcoming') {
    const startFmt = new Date(config.startDate).toLocaleString('vi-VN');
    return {
      success: false,
      message: `Cuộc thi chưa bắt đầu bình chọn! Cổng bình chọn sẽ mở vào: ${startFmt}`
    };
  }

  if (status === 'ended') {
    return {
      success: false,
      message: 'Thời gian bình chọn đã kết thúc! Kết quả đã được chốt và công bố chính thức.'
    };
  }

  // Check if user already voted
  if (voter.votedVideoIds && voter.votedVideoIds.length >= config.maxVotesPerUser) {
    return {
      success: false,
      message: 'Tài khoản của bạn đã sử dụng hết số lượt bình chọn cho phép!'
    };
  }

  // Check fanpage follow requirement
  if (config.requireFanpageFollow && !voter.hasFollowedFanpage) {
    return {
      success: false,
      message: 'Vui lòng xác nhận đã Follow Fanpage để mở khóa lượt bình chọn!'
    };
  }

  const videos = loadVideos();
  const videoIndex = videos.findIndex(v => v.id === videoId);
  if (videoIndex === -1) {
    return {
      success: false,
      message: 'Không tìm thấy video dự thi!'
    };
  }

  // Increment vote count
  videos[videoIndex].votes += 1;
  saveVideos(videos);

  // Update voter
  const updatedVoter: VoterProfile = {
    ...voter,
    votedVideoIds: [...(voter.votedVideoIds || []), videoId],
    lastVotedAt: Date.now()
  };
  saveCurrentVoter(updatedVoter);

  return {
    success: true,
    message: `Bình chọn thành công cho "${videos[videoIndex].title}"!`,
    updatedVideos: videos,
    updatedVoter
  };
}

/**
 * Create a single video entry
 */
export function createVideo(params: {
  title: string;
  author: string;
  fbUrl: string;
  description?: string;
  tags?: string[];
}): VideoItem {
  const current = loadVideos();
  const nextNum = current.length + 1;
  const padNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
  const parsed = parseVideoUrl(params.fbUrl);

  const newVideo: VideoItem = {
    id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    code: `SBD ${padNum}`,
    title: params.title.trim(),
    author: params.author.trim() || 'Thí sinh tự do',
    description: params.description?.trim() || '',
    fbUrl: params.fbUrl.trim(),
    embedUrl: parsed.embedUrl,
    thumbnailUrl: '/src/assets/images/contest_stage_banner_1793708279116.jpg',
    authorAvatar: '/src/assets/images/creator_avatar_male_1793708281689.jpg',
    votes: 0,
    createdAt: Date.now(),
    tags: params.tags && params.tags.length > 0 ? params.tags : ['Facebook Video']
  };

  const updated = [newVideo, ...current];
  saveVideos(updated);
  return newVideo;
}

/**
 * Bulk create videos from imported list
 */
export function bulkCreateVideos(items: Array<{
  title: string;
  author: string;
  fbUrl: string;
  description?: string;
  tags?: string[];
}>): VideoItem[] {
  const current = loadVideos();
  let nextNum = current.length + 1;

  const newVideos: VideoItem[] = items.map((item, index) => {
    const num = nextNum + index;
    const padNum = num < 10 ? `0${num}` : `${num}`;
    const parsed = parseVideoUrl(item.fbUrl);

    return {
      id: `vid-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      code: `SBD ${padNum}`,
      title: item.title.trim(),
      author: item.author.trim() || 'Thí sinh',
      description: item.description?.trim() || '',
      fbUrl: item.fbUrl.trim(),
      embedUrl: parsed.embedUrl,
      thumbnailUrl: '/src/assets/images/contest_stage_banner_1793708279116.jpg',
      authorAvatar: index % 2 === 0
        ? '/src/assets/images/creator_avatar_female_1793708279614.jpg'
        : '/src/assets/images/creator_avatar_male_1793708281689.jpg',
      votes: 0,
      createdAt: Date.now() - index * 1000,
      tags: item.tags || ['Danh sách tải lên']
    };
  });

  const updated = [...newVideos, ...current];
  saveVideos(updated);
  return updated;
}

/**
 * Reset all votes to 0 (admin feature)
 */
export function resetContestVotes(): VideoItem[] {
  const current = loadVideos();
  const resetList = current.map(v => ({ ...v, votes: 0 }));
  saveVideos(resetList);
  const voter = loadCurrentVoter();
  if (voter) {
    saveCurrentVoter({ ...voter, votedVideoIds: [] });
  }
  return resetList;
}
