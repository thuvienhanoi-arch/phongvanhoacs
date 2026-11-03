import { ContestConfig, VideoItem } from '../types/contest';

/**
 * Generate a high-resolution Leaderboard Infographic using HTML5 Canvas
 * and triggers immediate PNG download.
 */
export async function exportLeaderboardImage(
  config: ContestConfig,
  videos: VideoItem[]
): Promise<string> {
  const canvas = document.createElement('canvas');
  // High-res 1200x675 (standard 16:9 Facebook feed ratio)
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2d context');

  // Background dark gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
  bgGrad.addColorStop(0, '#0f172a'); // slate-900
  bgGrad.addColorStop(0.5, '#1e293b'); // slate-800
  bgGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 675);

  // Decorative subtle glow circles
  const glow1 = ctx.createRadialGradient(250, 150, 20, 250, 150, 400);
  glow1.addColorStop(0, 'rgba(37, 99, 235, 0.25)'); // blue
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, 600, 400);

  const glow2 = ctx.createRadialGradient(950, 500, 20, 950, 500, 400);
  glow2.addColorStop(0, 'rgba(234, 179, 8, 0.18)'); // amber gold
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(600, 200, 600, 475);

  // Border frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, 1140, 615);

  // Header Subtitle / Tag
  ctx.fillStyle = '#60a5fa'; // blue-400
  ctx.font = '700 15px "Be Vietnam Pro", sans-serif';
  ctx.fillText('KẾT QUẢ BÌNH CHỌN CHÍNH THỨC · FACEBOOK VIDEO AWARDS', 60, 75);

  // Contest Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 30px "Be Vietnam Pro", sans-serif';
  const cleanTitle = config.title.length > 55 ? config.title.substring(0, 52) + '...' : config.title;
  ctx.fillText(cleanTitle, 60, 115);

  // Sorted list
  const sorted = [...videos].sort((a, b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((sum, v) => sum + v.votes, 0) || 1;
  const topThree = sorted.slice(0, 3);

  // Top 3 Podium Cards
  const cardWidth = 345;
  const cardHeight = 360;
  const startY = 160;
  const gap = 30;
  const startX = 60;

  const ranks = [
    { label: 'QUÁN QUÂN · TOP 1', color: '#f59e0b', stroke: '#fbbf24', medal: '🥇' },
    { label: 'Á QUÂN 1 · TOP 2', color: '#94a3b8', stroke: '#cbd5e1', medal: '🥈' },
    { label: 'Á QUÂN 2 · TOP 3', color: '#d97706', stroke: '#f59e0b', medal: '🥉' }
  ];

  topThree.forEach((item, idx) => {
    const x = startX + idx * (cardWidth + gap);
    const r = ranks[idx];
    const pct = ((item.votes / totalVotes) * 100).toFixed(1);

    // Card background
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.beginPath();
    ctx.roundRect(x, startY, cardWidth, cardHeight, 16);
    ctx.fill();

    // Card border
    ctx.strokeStyle = idx === 0 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = idx === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(x, startY, cardWidth, cardHeight, 16);
    ctx.stroke();

    // Rank Medal & Label
    ctx.fillStyle = r.color;
    ctx.font = '800 14px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`${r.medal} ${r.label}`, x + 24, startY + 40);

    // SBD Code
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillText(item.code, x + cardWidth - 85, startY + 40);

    // Title (wrapped)
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px "Be Vietnam Pro", sans-serif';
    wrapText(ctx, item.title, x + 24, startY + 80, cardWidth - 48, 24, 2);

    // Author
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 14px "Be Vietnam Pro", sans-serif';
    const authorText = `Tác giả: ${item.author}`;
    ctx.fillText(truncateText(ctx, authorText, cardWidth - 48), x + 24, startY + 160);

    // Vote progress bar container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(x + 24, startY + 195, cardWidth - 48, 10, 5);
    ctx.fill();

    // Vote progress bar fill
    const fillWidth = Math.max(10, ((cardWidth - 48) * (item.votes / (sorted[0]?.votes || 1))));
    ctx.fillStyle = r.color;
    ctx.beginPath();
    ctx.roundRect(x + 24, startY + 195, fillWidth, 10, 5);
    ctx.fill();

    // Vote Big Number
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 36px "JetBrains Mono", monospace';
    ctx.fillText(item.votes.toLocaleString('vi-VN'), x + 24, startY + 265);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px "Be Vietnam Pro", sans-serif';
    ctx.fillText('phiếu bình chọn', x + 24, startY + 295);

    // Percentage
    ctx.fillStyle = r.color;
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText(`${pct}%`, x + cardWidth - 95, startY + 265);
  });

  // Footer section
  ctx.fillStyle = '#64748b';
  ctx.font = '500 13px "Be Vietnam Pro", sans-serif';
  ctx.fillText(
    `Tổng lượt bình chọn: ${totalVotes.toLocaleString('vi-VN')} · Cập nhật ngày: ${new Date().toLocaleDateString('vi-VN')}`,
    60,
    590
  );

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
  ctx.fillText(`Fanpage: ${config.fanpageName}`, 60, 615);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 14px "Be Vietnam Pro", sans-serif';
  ctx.fillText('✓ Hệ thống bình chọn công khai & minh bạch', 850, 605);

  const dataUrl = canvas.toDataURL('image/png');

  // Trigger download
  const link = document.createElement('a');
  link.download = `Ket_qua_binh_chon_${Date.now()}.png`;
  link.href = dataUrl;
  link.click();

  return dataUrl;
}

/**
 * Export full CSV report for contest organizers
 */
export function exportContestCSV(config: ContestConfig, videos: VideoItem[]): void {
  const sorted = [...videos].sort((a, b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((sum, v) => sum + v.votes, 0) || 1;

  const header = ['Xếp hạng', 'Mã SBD', 'Tên tác phẩm', 'Tác giả / Nhóm', 'Số lượt vote', 'Tỷ lệ (%)', 'Link Facebook Video'];
  const rows = sorted.map((v, index) => {
    const pct = ((v.votes / totalVotes) * 100).toFixed(2);
    return [
      `"${index + 1}"`,
      `"${v.code}"`,
      `"${v.title.replace(/"/g, '""')}"`,
      `"${v.author.replace(/"/g, '""')}"`,
      `"${v.votes}"`,
      `"${pct}%"`,
      `"${v.fbUrl.replace(/"/g, '""')}"`
    ];
  });

  // Include UTF-8 BOM for Microsoft Excel Vietnamese support
  const csvContent = '\uFEFF' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_cao_binh_chon_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 2
) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + '...', x, y);
        return;
      }
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}
