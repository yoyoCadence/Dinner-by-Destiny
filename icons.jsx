/* 簡易線性圖示 */
function Icon({ d, size = 24, fill = 'none', stroke = 'currentColor', sw = 1.8, children, vb = 24 }) {
  return React.createElement('svg', { width: size, height: size, viewBox: `0 0 ${vb} ${vb}`, fill, stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' },
    d ? React.createElement('path', { d }) : children
  );
}

const Icons = {
  compass: (p) => React.createElement(Icon, { ...p }, React.createElement('circle', { cx: '12', cy: '12', r: '9' }), React.createElement('path', { d: 'M15.5 8.5l-2 5-5 2 2-5z' })),
  dice: (p) => React.createElement(Icon, { ...p }, React.createElement('rect', { x: '4', y: '4', width: '16', height: '16', rx: '4' }), React.createElement('circle', { cx: '9', cy: '9', r: '1.1', fill: 'currentColor', stroke: 'none' }), React.createElement('circle', { cx: '15', cy: '15', r: '1.1', fill: 'currentColor', stroke: 'none' }), React.createElement('circle', { cx: '15', cy: '9', r: '1.1', fill: 'currentColor', stroke: 'none' }), React.createElement('circle', { cx: '9', cy: '15', r: '1.1', fill: 'currentColor', stroke: 'none' })),
  book: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z' }), React.createElement('path', { d: 'M4 20.5A2.5 2.5 0 0 1 6.5 18H20' })),
  chart: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M4 20V10M10 20V4M16 20v-7M22 20H2' })),
  gear: (p) => React.createElement(Icon, { ...p }, React.createElement('circle', { cx: '12', cy: '12', r: '3' }), React.createElement('path', { d: 'M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1' })),
  search: (p) => React.createElement(Icon, { ...p }, React.createElement('circle', { cx: '11', cy: '11', r: '7' }), React.createElement('path', { d: 'm20 20-3.5-3.5' })),
  pin: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z' }), React.createElement('circle', { cx: '12', cy: '10', r: '2.4' })),
  walk: (p) => React.createElement(Icon, { ...p }, React.createElement('circle', { cx: '13', cy: '4', r: '1.6' }), React.createElement('path', { d: 'M11 21l1.5-5-2.5-2 1-5 3 2 2 1M9 12l1-3M12.5 16l2 5' })),
  star: (p) => React.createElement(Icon, { ...p, fill: 'currentColor', stroke: 'none' }, React.createElement('path', { d: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9z' })),
  starO: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9z' })),
  close: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M6 6l12 12M18 6L6 18' })),
  check: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M4 12.5l5 5 11-11' })),
  plus: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M12 5v14M5 12h14' })),
  nav: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M3 11l18-8-8 18-2-8z' })),
  fire: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M12 3c1 3-1 4-1 6a3 3 0 0 0 6 0c0-1-.3-2-1-3 2 1.5 3 4 3 6a6 6 0 1 1-12 0c0-3.5 3-4 5-9z' })),
  sleep: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M19 13.5A7.5 7.5 0 1 1 10.5 5 6 6 0 0 0 19 13.5z' })),
  users: (p) => React.createElement(Icon, { ...p }, React.createElement('circle', { cx: '9', cy: '8', r: '3' }), React.createElement('path', { d: 'M3.5 20a5.5 5.5 0 0 1 11 0' }), React.createElement('path', { d: 'M16 5.2a3 3 0 0 1 0 5.6M17 14.5a5.5 5.5 0 0 1 3.5 5.5' })),
  chevR: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M9 6l6 6-6 6' })),
  refresh: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4' }), React.createElement('path', { d: 'M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4' })),
  filter: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M3 5h18M6 12h12M10 19h4' })),
  heart: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M12 20s-7-4.7-7-10A4 4 0 0 1 12 6a4 4 0 0 1 7 4c0 5.3-7 10-7 10z' })),
  trophy: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M7 4h10v4a5 5 0 0 1-10 0z' }), React.createElement('path', { d: 'M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M9 17h6M10 17l.5-3h3l.5 3M8 21h8' })),
  trash: (p) => React.createElement(Icon, { ...p }, React.createElement('path', { d: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13' })),
};

window.Icons = Icons;
window.Icon = Icon;
