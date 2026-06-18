/* 主題系統與工具函式 */

// 4 種 App 內可切換的視覺風格。每個主題 = 一組 CSS 變數。
window.THEMES = {
  warm: {
    name: '溫暖食慾',
    desc: '暖橘奶油色 · 圓潤親切',
    swatch: ['#E8853B', '#F6E4CE', '#3A2A1E'],
    vars: {
      '--bg': '#F6ECDD',
      '--bg-grad': 'radial-gradient(120% 80% at 50% -10%, #FBEFDC 0%, #F2E2CB 55%, #ECD9BD 100%)',
      '--surface': '#FFFFFF',
      '--surface-2': '#FBF3E7',
      '--ink': '#3A2A1E',
      '--ink-soft': '#8A7560',
      '--ink-faint': '#B7A48E',
      '--accent': '#E8853B',
      '--accent-ink': '#FFFFFF',
      '--accent-soft': '#FBE2C9',
      '--gold': '#D9A441',
      '--line': '#EADBC4',
      '--shadow': '0 12px 32px -12px rgba(120,80,30,.28)',
      '--radius': '22px',
      '--font': "'Noto Sans TC', system-ui, sans-serif",
      '--font-display': "'Baloo 2', 'Noto Sans TC', sans-serif",
      '--chrome': '#3A2A1E',
    },
  },
  minimal: {
    name: '簡約日系',
    desc: '米白淺灰 · 留白乾淨',
    swatch: ['#1C1A17', '#F6F5F1', '#A8A29A'],
    vars: {
      '--bg': '#F3F2EE',
      '--bg-grad': 'linear-gradient(180deg, #F6F5F1 0%, #EFEEE8 100%)',
      '--surface': '#FFFFFF',
      '--surface-2': '#F7F6F2',
      '--ink': '#1C1A17',
      '--ink-soft': '#7C766C',
      '--ink-faint': '#ABA499',
      '--accent': '#1C1A17',
      '--accent-ink': '#FFFFFF',
      '--accent-soft': '#E7E5DE',
      '--gold': '#9A8B6B',
      '--line': '#E5E3DC',
      '--shadow': '0 10px 30px -16px rgba(40,38,32,.22)',
      '--radius': '16px',
      '--font': "'Noto Sans TC', system-ui, sans-serif",
      '--font-display': "'Noto Serif TC', 'Noto Sans TC', serif",
      '--chrome': '#1C1A17',
    },
  },
  dark: {
    name: '深色質感',
    desc: '深底霓虹點綴 · 夜晚找吃',
    swatch: ['#16E0C2', '#0E0D14', '#B47BFF'],
    vars: {
      '--bg': '#0E0D14',
      '--bg-grad': 'radial-gradient(120% 90% at 50% -10%, #1A1826 0%, #121119 55%, #0B0A11 100%)',
      '--surface': '#1A1823',
      '--surface-2': '#222031',
      '--ink': '#F3F1FA',
      '--ink-soft': '#A6A1C0',
      '--ink-faint': '#6E6889',
      '--accent': '#16E0C2',
      '--accent-ink': '#06120F',
      '--accent-soft': '#16302C',
      '--gold': '#FFD66B',
      '--line': '#2C2940',
      '--shadow': '0 16px 40px -16px rgba(0,0,0,.6)',
      '--radius': '20px',
      '--font': "'Noto Sans TC', system-ui, sans-serif",
      '--font-display': "'Sora', 'Noto Sans TC', sans-serif",
      '--chrome': '#F3F1FA',
    },
  },
  playful: {
    name: '活潑趣味',
    desc: '高彩度 · 骰子遊戲感',
    swatch: ['#FF5A5F', '#FFF3D6', '#2B6CFF'],
    vars: {
      '--bg': '#FFF3D6',
      '--bg-grad': 'radial-gradient(110% 80% at 50% -10%, #FFE9A8 0%, #FFE0C2 50%, #FFD0D2 100%)',
      '--surface': '#FFFFFF',
      '--surface-2': '#FFF6E6',
      '--ink': '#2A2140',
      '--ink-soft': '#7E6BA0',
      '--ink-faint': '#B5A6CE',
      '--accent': '#FF5A5F',
      '--accent-ink': '#FFFFFF',
      '--accent-soft': '#FFE0E1',
      '--gold': '#FFB22E',
      '--line': '#F2E3C6',
      '--shadow': '0 14px 34px -12px rgba(255,90,95,.32)',
      '--radius': '26px',
      '--font': "'Noto Sans TC', system-ui, sans-serif",
      '--font-display': "'Baloo 2', 'Noto Sans TC', sans-serif",
      '--chrome': '#2A2140',
    },
  },
};

window.applyTheme = function (root, key) {
  const t = window.THEMES[key] || window.THEMES.warm;
  const targets = [];
  if (typeof document !== 'undefined') {
    if (document.documentElement) targets.push(document.documentElement);
    if (document.body) targets.push(document.body);
  }
  if (root) targets.push(root);
  targets.forEach(function (target) {
    Object.entries(t.vars).forEach(([k, v]) => target.style.setProperty(k, v));
  });
};

// haversine 距離（公尺）
window.distM = function (a, b) {
  const R = 6371000, toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

window.fmtDist = function (m) {
  if (m < 1000) return Math.round(m / 10) * 10 + ' m';
  return (m / 1000).toFixed(1) + ' km';
};

window.priceStr = (p) => '$'.repeat(p);

window.cuisineOf = (key) => window.CUISINES.find((c) => c.key === key) || { label: key, emoji: '🍽️' };

// 走路時間估計（80 m/分）
window.walkMin = (m) => Math.max(1, Math.round(m / 80));

// 開啟 Google Maps 導航
window.openMaps = function (r) {
  const q = encodeURIComponent(r.name + ' ' + (r.city || ''));
  const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
  window.open(url, '_blank');
};

// 日期工具
window.dateStr = function (d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

window.todayStr = function () {
  return window.dateStr(new Date());
};
window.daysAgo = function (str) {
  if (!str) return 999;
  const ms = Date.now() - new Date(str + 'T00:00:00').getTime();
  return Math.floor(ms / 86400000);
};
window.fmtAgo = function (str) {
  const d = window.daysAgo(str);
  if (d <= 0) return '今天';
  if (d === 1) return '昨天';
  if (d < 7) return d + ' 天前';
  if (d < 30) return Math.floor(d / 7) + ' 週前';
  return Math.floor(d / 30) + ' 個月前';
};
