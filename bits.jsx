/* 共用小元件 */
const { Icons } = window;
const { useState: useBitsState, useRef: useBitsRef, useEffect: useBitsEffect } = React;

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

// 量測 iPhone 瀏海/動態島的頂部安全區高度（env(safe-area-inset-top)），量一次後快取
let _safeTopInset = null;
function safeTopInset() {
  if (_safeTopInset != null) return _safeTopInset;
  try {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none;';
    document.body.appendChild(probe);
    _safeTopInset = probe.getBoundingClientRect().height || 0;
    document.body.removeChild(probe);
  } catch (e) { _safeTopInset = 0; }
  return _safeTopInset;
}

function Sheet({ open, onClose, children, title, full }) {
  // 可見視窗（VisualViewport）：鍵盤彈出時會即時縮小，分頁因此只佔「鍵盤上方」可見區，
  // 內容在分頁內捲動，而不是去捲整個 App（避免背景跟著動）。
  const readVV = function () {
    const v = window.visualViewport;
    return v ? { h: v.height, top: v.offsetTop } : { h: window.innerHeight, top: 0 };
  };
  const [vv, setVv] = useBitsState(readVV);
  const [expanded, setExpanded] = useBitsState(false); // 是否已拖到放大（接近全高）
  const [dragH, setDragH] = useBitsState(null);        // 拖曳中的即時高度(px)，null = 用預設
  const [dragY, setDragY] = useBitsState(0);           // 往下拉準備關閉的位移(px)
  const [dragging, setDragging] = useBitsState(false);
  const dragRef = useBitsRef({ startY: 0, baseH: 0, delta: 0, active: false });
  const panelRef = useBitsRef(null);

  // 追蹤可見視窗高度/位移；rezize 與 scroll 都更新，抵銷 iOS 鍵盤造成的位移
  useBitsEffect(function () {
    if (!open) return;
    const v = window.visualViewport;
    const update = function () { setVv(readVV()); };
    update();
    if (v) {
      v.addEventListener('resize', update);
      v.addEventListener('scroll', update);
      return function () { v.removeEventListener('resize', update); v.removeEventListener('scroll', update); };
    }
    window.addEventListener('resize', update);
    return function () { window.removeEventListener('resize', update); };
  }, [open]);

  // 關閉後重置拖曳/放大狀態，下次開啟回到預設高度
  useBitsEffect(function () {
    if (!open) { setExpanded(false); setDragH(null); setDragY(0); setDragging(false); }
  }, [open]);

  // hooks 之後才可提早 return
  if (!open) return null;

  const availH = vv.h || window.innerHeight;
  // 放大上限：扣掉瀏海/動態島安全區 + 緩衝，讓頂部橫條永遠停在瀏海下方、抓得到
  const topReserve = Math.max(safeTopInset(), 8) + 16;
  const maxLargeH = Math.max(240, availH - topReserve);                          // 放大時高度
  const defaultMaxH = Math.min(maxLargeH, Math.round(availH * (full ? 0.92 : 0.8))); // 預設高度上限

  const startDrag = function (e) {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const baseH = panelRef.current ? panelRef.current.offsetHeight : defaultMaxH;
    dragRef.current = { startY: y, baseH: baseH, delta: 0, active: true };
    setDragging(true);
  };
  const moveDrag = function (e) {
    if (!dragRef.current.active) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = y - dragRef.current.startY;
    dragRef.current.delta = delta;
    if (delta < 0) {                                            // 往上拉 → 即時長高（拖到哪長到哪）
      setDragH(Math.min(maxLargeH, dragRef.current.baseH - delta));
      setDragY(0);
    } else {                                                    // 往下拉 → 位移，準備關閉
      setDragY(delta);
    }
  };
  const endDrag = function () {
    if (!dragRef.current.active) return;
    const delta = dragRef.current.delta;
    dragRef.current.active = false;
    setDragging(false);
    setDragY(0);
    if (delta > 90) { onClose(); return; }                              // 往下拉夠多 → 關閉
    if (delta < -40) { setExpanded(true); setDragH(null); return; }     // 往上拉 → 放大並定住
    if (expanded && delta > 24) { setExpanded(false); }                 // 已放大時小幅下拉 → 縮回
    setDragH(null);                                                     // 其餘 → 回到目前狀態
  };
  const dragHandlers = { onTouchStart: startDrag, onTouchMove: moveDrag, onTouchEnd: endDrag };

  // 聚焦輸入欄位時，把欄位捲到鍵盤上方可見處（分頁內捲動，不動到整個 App）
  const onFocusIn = function (e) {
    const t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) {
      setTimeout(function () { try { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (err) {} }, 300);
    }
  };

  // 高度：拖曳中用即時值；放大用大尺寸；否則內容自適應 + 上限
  const heightStyle = dragH != null
    ? { height: dragH + 'px' }
    : (expanded ? { height: maxLargeH + 'px' } : { maxHeight: defaultMaxH + 'px' });

  const overlayStyle = {
    position: 'fixed', left: 0, right: 0, top: (vv.top || 0) + 'px', height: availH + 'px',
    zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    background: 'rgba(10,8,6,.42)', backdropFilter: 'blur(2px)', animation: 'fadeIn .2s ease',
  };
  const panelStyle = Object.assign({
    background: 'var(--surface)', borderTopLeftRadius: 26, borderTopRightRadius: 26,
    display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,.25)',
    animation: 'sheetUp .28s cubic-bezier(.2,.9,.3,1)',
    transform: 'translateY(' + dragY + 'px)',
    transition: dragging ? 'none' : 'transform .26s cubic-bezier(.2,.9,.3,1), height .26s ease, max-height .26s ease',
  }, heightStyle);

  return React.createElement('div', { onClick: onClose, style: overlayStyle },
    React.createElement('div', { ref: panelRef, onClick: (e) => e.stopPropagation(), style: panelStyle },
      React.createElement('div', Object.assign({ style: { padding: '10px 0 6px', display: 'flex', justifyContent: 'center', flexShrink: 0, cursor: 'grab', touchAction: 'none' } }, dragHandlers),
        React.createElement('div', { style: { width: 40, height: 5, borderRadius: 4, background: 'var(--line)' } })
      ),
      title && React.createElement('div', Object.assign({ style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 20px 10px', flexShrink: 0, cursor: 'grab', touchAction: 'none' } }, dragHandlers),
        React.createElement('h3', { style: { margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' } }, title),
        React.createElement('button', { onClick: onClose, onTouchStart: (e) => e.stopPropagation(), style: { background: 'var(--surface-2)', border: 'none', borderRadius: 999, width: 32, height: 32, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--ink-soft)' } },
          React.createElement(Icons.close, { size: 18 })
        )
      ),
      React.createElement('div', { onFocus: onFocusIn, style: { flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' } }, children)
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
