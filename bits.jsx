/* 共用小元件 */
const { Icons } = window;

function Stars({ value, size = 13, onChange }) {
  const full = Math.round(value || 0);
  return React.createElement('span', { style: { display: 'inline-flex', gap: 1, color: 'var(--gold)' } },
    [1, 2, 3, 4, 5].map((i) => {
      const C = i <= full ? Icons.star : Icons.starO;
      return React.createElement('span', { key: i, onClick: onChange ? (e) => { e.stopPropagation(); onChange(i); } : undefined, style: { cursor: onChange ? 'pointer' : 'default', lineHeight: 0 } },
        React.createElement(C, { size: size })
      );
    })
  );
}

function PriceTag({ p }) {
  return React.createElement('span', { style: { color: 'var(--ink-soft)', fontWeight: 700, letterSpacing: '.5px' } },
    React.createElement('span', { style: { color: 'var(--ink)' } }, '$'.repeat(p)),
    React.createElement('span', { style: { opacity: .35 } }, '$'.repeat(3 - p))
  );
}

function EatBadge({ n, accent }) {
  const hot = n >= 10;
  return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 800, padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap', background: accent ? 'var(--accent)' : 'var(--surface-2)', color: accent ? 'var(--accent-ink)' : 'var(--ink-soft)', border: accent ? 'none' : '1px solid var(--line)' } },
    hot && React.createElement(Icons.fire, { size: 12 }),
    '吃過 ' + n + ' 次'
  );
}

function Chip({ active, onClick, children, emoji }) {
  return React.createElement('button', { onClick: onClick, style: { display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', fontSize: 13, fontWeight: 700, padding: '7px 13px', borderRadius: 999, border: '1.5px solid ' + (active ? 'var(--accent)' : 'var(--line)'), background: active ? 'var(--accent)' : 'var(--surface)', color: active ? 'var(--accent-ink)' : 'var(--ink-soft)', cursor: 'pointer', transition: 'all .15s', flexShrink: 0 } },
    emoji && React.createElement('span', { style: { fontSize: 14 } }, emoji),
    children
  );
}

function SegBar({ options, value, onChange, small }) {
  return React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + options.length + ', 1fr)', background: 'var(--surface-2)', borderRadius: 12, padding: 3, gap: 3, border: '1px solid var(--line)' } },
    options.map((o) => React.createElement('button', { key: o.value, onClick: () => onChange(o.value), style: { fontSize: small ? 12.5 : 13.5, fontWeight: 700, padding: small ? '6px 4px' : '8px 6px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'all .15s', background: value === o.value ? 'var(--surface)' : 'transparent', color: value === o.value ? 'var(--ink)' : 'var(--ink-soft)', boxShadow: value === o.value ? 'var(--shadow)' : 'none' } }, o.label))
  );
}

function Sheet({ open, onClose, children, title, full }) {
  if (!open) return null;
  return React.createElement('div', { onClick: onClose, style: { position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(10,8,6,.42)', backdropFilter: 'blur(2px)', animation: 'fadeIn .2s ease' } },
    React.createElement('div', { onClick: (e) => e.stopPropagation(), style: { background: 'var(--surface)', borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: full ? '92%' : '80%', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,.25)', animation: 'sheetUp .28s cubic-bezier(.2,.9,.3,1)' } },
      React.createElement('div', { style: { padding: '10px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 } },
        React.createElement('div', { style: { width: 38, height: 4, borderRadius: 4, background: 'var(--line)' } })
      ),
      title && React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 10px', flexShrink: 0 } },
        React.createElement('h3', { style: { margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' } }, title),
        React.createElement('button', { onClick: onClose, style: { background: 'var(--surface-2)', border: 'none', borderRadius: 999, width: 32, height: 32, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--ink-soft)' } },
          React.createElement(Icons.close, { size: 18 })
        )
      ),
      React.createElement('div', { style: { overflowY: 'auto', WebkitOverflowScrolling: 'touch' } }, children)
    )
  );
}

// 橫向捲動列：手機可觸控滑動，桌機用滾輪（垂直滾輪轉成水平捲動）
function HScroll({ children, style }) {
  const ref = React.useRef(null);
  const onWheel = function (e) {
    const el = ref.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) el.scrollLeft += e.deltaY;
  };
  return React.createElement('div', { ref: ref, onWheel: onWheel, className: 'hscroll', style: Object.assign({ display: 'flex', flexWrap: 'nowrap', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }, style || {}) }, children);
}

// 分類選擇器：emoji 下拉，用於匯入確認與餐廳詳情（純程式分類後的人工微調）
function CuisinePicker({ value, onChange, compact }) {
  const opts = (window.CUISINES || []).filter((c) => c.key !== 'unknown');
  return React.createElement('select', {
    value: value || 'unknown',
    onChange: (e) => onChange(e.target.value),
    onClick: (e) => e.stopPropagation(),
    style: { fontFamily: 'var(--font)', fontSize: compact ? 12.5 : 14, fontWeight: 700, color: value && value !== 'unknown' ? 'var(--ink)' : 'var(--accent)', background: value && value !== 'unknown' ? 'var(--surface)' : 'var(--accent-soft)', border: '1.5px solid ' + (value && value !== 'unknown' ? 'var(--line)' : 'var(--accent)'), borderRadius: 10, padding: compact ? '6px 8px' : '9px 11px', cursor: 'pointer' },
  },
    React.createElement('option', { value: 'unknown', disabled: true }, '❔ 待分類…'),
    opts.map((c) => React.createElement('option', { key: c.key, value: c.key }, c.emoji + ' ' + c.label))
  );
}

window.Stars = Stars;
window.PriceTag = PriceTag;
window.EatBadge = EatBadge;
window.Chip = Chip;
window.SegBar = SegBar;
window.Sheet = Sheet;
window.HScroll = HScroll;
window.CuisinePicker = CuisinePicker;
