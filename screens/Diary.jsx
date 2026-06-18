/* 用餐紀錄頁 + 記錄表單 */
const { Icons } = window;
const { useState, useMemo } = React;

const MOODS = [
  { key: 'love', emoji: '😍', label: '超愛' },
  { key: 'good', emoji: '😋', label: '好吃' },
  { key: 'ok', emoji: '🙂', label: '普通' },
  { key: 'meh', emoji: '😐', label: '還好' },
  { key: 'bad', emoji: '😣', label: '踩雷' },
];

const inpWrap = { background: 'var(--surface-2)', border: '1.5px solid var(--line)', borderRadius: 12, padding: '11px 13px' };
const inpBare = { border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--font)', width: '100%' };
const inp = { ...inpWrap, ...inpBare, marginTop: 8, boxSizing: 'border-box' };
const label = { fontSize: 13, fontWeight: 800, color: 'var(--ink)', margin: '0 0 7px' };

function LogSheet({ store, preset, onClose }) {
  const { state } = store;
  const inRange = useMemo(() => {
    const arr = state.restaurants
      .map((r) => ({ r, dist: window.distM(window.HOME_LOC, r) }))
      .sort((a, b) => a.dist - b.dist);
    if (preset) {
      const i = arr.findIndex((x) => x.r.id === preset.id);
      if (i > 0) { const p = arr.splice(i, 1)[0]; arr.unshift(p); }
    }
    return arr;
  }, [state.restaurants, preset]);
  const [restId, setRestId] = useState(preset ? preset.id : (state.restaurants[0] && state.restaurants[0].id));
  const [custom, setCustom] = useState('');
  const [mood, setMood] = useState('good');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(window.todayStr());
  const [q, setQ] = useState('');
  const [cuisineF, setCuisineF] = useState('all');

  const cuisinesPresent = useMemo(() => {
    const set = new Set(state.restaurants.map((r) => r.cuisine));
    return window.CUISINES.filter((c) => set.has(c.key));
  }, [state.restaurants]);

  const filtered = useMemo(() => inRange.filter(({ r }) => {
    if (q) return r.name.includes(q) || window.cuisineOf(r.cuisine).label.includes(q) || (r.city || '').includes(q);
    if (cuisineF !== 'all' && r.cuisine !== cuisineF) return false;
    return true;
  }), [inRange, cuisineF, q]);

  const save = () => {
    const r = state.restaurants.find((x) => x.id === restId);
    const name = custom.trim() || (r && r.name);
    if (!name) return;
    store.logMeal({
      date, restId: custom.trim() ? null : restId,
      name, cuisine: custom.trim() ? null : (r && r.cuisine),
      price: custom.trim() ? null : (r && r.price),
      cost: null, mood, note,
    });
    onClose();
  };

  return React.createElement('div', { style: { padding: '4px 20px 26px', display: 'flex', flexDirection: 'column', gap: 18 } },
    React.createElement('div', null,
      React.createElement('p', { style: label }, '吃了哪一家？'),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, ...inpWrap, marginBottom: 8 } },
        React.createElement(Icons.search, { size: 16, color: 'var(--ink-faint)' }),
        React.createElement('input', { value: q, onChange: (e) => setQ(e.target.value), placeholder: '搜尋餐廳、料理、城市…', style: { ...inpBare } }),
        q && React.createElement('button', { onClick: () => setQ(''), style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)' } }, React.createElement(Icons.close, { size: 15 }))
      ),
      React.createElement(window.HScroll, { style: { paddingBottom: 8 } },
        React.createElement(window.Chip, { active: cuisineF === 'all', onClick: () => setCuisineF('all') }, '全部'),
        cuisinesPresent.map((c) => React.createElement(window.Chip, { key: c.key, emoji: c.emoji, active: cuisineF === c.key, onClick: () => setCuisineF(c.key) }, c.label))
      ),
      React.createElement('div', { style: { maxHeight: 220, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', gap: 7, border: '1px solid var(--line)', borderRadius: 12, padding: 7, background: 'var(--surface-2)' } },
        filtered.length === 0
          ? React.createElement('div', { style: { padding: '18px', textAlign: 'center', color: 'var(--ink-faint)', fontSize: 13 } }, '找不到，可在下方自己打')
          : filtered.map(({ r }) => {
              const sel = !custom && restId === r.id;
              return React.createElement('button', { key: r.id, onClick: () => { setRestId(r.id); setCustom(''); }, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', border: '1.5px solid ' + (sel ? 'var(--accent)' : 'transparent'), background: sel ? 'var(--accent-soft)' : 'var(--surface)' } },
                React.createElement('span', { style: { fontSize: 20, flexShrink: 0 } }, window.cuisineOf(r.cuisine).emoji),
                React.createElement('span', { style: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, r.name),
                React.createElement('span', { style: { fontSize: 11.5, color: 'var(--ink-soft)', flexShrink: 0 } }, (r.city || '') + ' · ★' + r.rating),
                sel && React.createElement('span', { style: { color: 'var(--accent)', flexShrink: 0, display: 'inline-flex' } }, React.createElement(Icons.check, { size: 16 }))
              );
            })
      ),
      React.createElement('input', { value: custom, onChange: (e) => setCustom(e.target.value), placeholder: '或自己打：例如「公司樓下便當」', style: inp })
    ),
    React.createElement('div', null,
      React.createElement('p', { style: label }, '覺得如何？'),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        MOODS.map((m) => React.createElement('button', { key: m.key, onClick: () => setMood(m.key), style: { flex: 1, padding: '10px 0', borderRadius: 13, cursor: 'pointer', textAlign: 'center', border: '1.5px solid ' + (mood === m.key ? 'var(--accent)' : 'var(--line)'), background: mood === m.key ? 'var(--accent-soft)' : 'var(--surface)' } },
          React.createElement('div', { style: { fontSize: 24 } }, m.emoji),
          React.createElement('div', { style: { fontSize: 10.5, fontWeight: 700, color: 'var(--ink-soft)', marginTop: 2 } }, m.label)
        ))
      )
    ),
    React.createElement('div', null,
      React.createElement('p', { style: label }, '日期'),
      React.createElement('input', { type: 'date', value: date, onChange: (e) => setDate(e.target.value), style: inp })
    ),
    React.createElement('div', null,
      React.createElement('p', { style: label }, '備註（選填）'),
      React.createElement('input', { value: note, onChange: (e) => setNote(e.target.value), placeholder: '點了什麼、和誰吃…', style: inp })
    ),
    React.createElement('button', { onClick: save, style: { padding: '15px', borderRadius: 15, border: 'none', cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 16, fontWeight: 800 } }, '記錄這一餐')
  );
}

function DiaryEditSheet({ store, entry, onClose }) {
  const [mood, setMood] = useState(entry.mood || 'good');
  const [cost, setCost] = useState(entry.cost != null ? String(entry.cost) : '');
  const [note, setNote] = useState(entry.note || '');
  const [date, setDate] = useState(entry.date || window.todayStr());
  const cz = entry.cuisine ? window.cuisineOf(entry.cuisine) : null;

  const save = () => { store.updateDiary(entry.id, { date, cost: cost ? +cost : null, mood, note }); onClose(); };
  const del = () => { store.deleteDiary(entry.id); onClose(); };

  return React.createElement('div', { style: { padding: '4px 20px 26px', display: 'flex', flexDirection: 'column', gap: 18 } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 12 } },
      React.createElement('span', { style: { fontSize: 28 } }, cz ? cz.emoji : '🍽️'),
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 16, fontWeight: 800, color: 'var(--ink)' } }, entry.name),
        React.createElement('div', { style: { fontSize: 12, color: 'var(--ink-soft)' } }, cz ? cz.label : '自填')
      )
    ),
    React.createElement('div', null,
      React.createElement('p', { style: label }, '覺得如何？'),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        MOODS.map((m) => React.createElement('button', { key: m.key, onClick: () => setMood(m.key), style: { flex: 1, padding: '10px 0', borderRadius: 13, cursor: 'pointer', textAlign: 'center', border: '1.5px solid ' + (mood === m.key ? 'var(--accent)' : 'var(--line)'), background: mood === m.key ? 'var(--accent-soft)' : 'var(--surface)' } },
          React.createElement('div', { style: { fontSize: 24 } }, m.emoji),
          React.createElement('div', { style: { fontSize: 10.5, fontWeight: 700, color: 'var(--ink-soft)', marginTop: 2 } }, m.label)
        ))
      )
    ),
    React.createElement('div', { style: { display: 'flex', gap: 12 } },
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('p', { style: label }, '花了多少'),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, ...inpWrap } },
          React.createElement('span', { style: { color: 'var(--ink-soft)', fontWeight: 800 } }, '$'),
          React.createElement('input', { value: cost, onChange: (e) => setCost(e.target.value.replace(/\D/g, '')), inputMode: 'numeric', placeholder: '180', style: { ...inpBare } })
        )
      ),
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('p', { style: label }, '日期'),
        React.createElement('input', { type: 'date', value: date, onChange: (e) => setDate(e.target.value), style: inp })
      )
    ),
    React.createElement('div', null,
      React.createElement('p', { style: label }, '備註'),
      React.createElement('input', { value: note, onChange: (e) => setNote(e.target.value), placeholder: '點了什麼、和誰吃…', style: inp })
    ),
    React.createElement('div', { style: { display: 'flex', gap: 10 } },
      React.createElement('button', { onClick: del, style: { flex: 1, padding: '15px', borderRadius: 15, border: '1.5px solid #e7b6b3', cursor: 'pointer', background: 'var(--surface)', color: '#d9534f', fontSize: 15, fontWeight: 800 } }, '刪除這筆'),
      React.createElement('button', { onClick: save, style: { flex: 2, padding: '15px', borderRadius: 15, border: 'none', cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 16, fontWeight: 800 } }, '儲存')
    )
  );
}

function Diary({ store, onAdd, onEdit }) {
  const { state } = store;
  const groups = useMemo(() => {
    const g = {};
    state.diary.forEach((d) => { (g[d.date] = g[d.date] || []).push(d); });
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  }, [state.diary]);

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
    React.createElement('div', { style: { padding: '6px 18px 10px', flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' } },
      React.createElement('div', null,
        React.createElement('h1', { style: { margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' } }, '用餐日記'),
        React.createElement('p', { style: { margin: '2px 0 0', fontSize: 13, color: 'var(--ink-soft)' } }, '共記錄了 ' + state.diary.length + ' 餐')
      ),
      React.createElement('button', { onClick: onAdd, style: { display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', borderRadius: 999, padding: '9px 15px', fontSize: 14, fontWeight: 800, cursor: 'pointer' } },
        React.createElement(Icons.plus, { size: 17 }),
        '記一餐'
      )
    ),
    React.createElement('div', { style: { flex: 1, overflowY: 'auto', padding: '4px 18px 24px' } },
      groups.length === 0 ? React.createElement('div', { style: { textAlign: 'center', padding: '56px 24px', color: 'var(--ink-faint)' } },
        React.createElement('div', { style: { fontSize: 44, marginBottom: 10 } }, '🍽️'),
        '還沒有任何紀錄',
        React.createElement('br', null),
        '吃完一餐就按「記一餐」',
        React.createElement('br', null),
        '之後骰子上會顯示你吃過幾次'
      ) : React.createElement('div', null,
        groups.map(([date, entries]) => React.createElement('div', { key: date, style: { marginBottom: 18 } },
          React.createElement('div', { style: { fontSize: 12.5, fontWeight: 800, color: 'var(--ink-faint)', margin: '0 2px 8px', display: 'flex', alignItems: 'center', gap: 8 } },
            window.fmtAgo(date),
            ' ',
            React.createElement('span', { style: { fontWeight: 600, color: 'var(--ink-faint)', opacity: .7 } }, date)
          ),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 9 } },
            entries.map((d) => {
              const m = MOODS.find((x) => x.key === d.mood) || MOODS[2];
              return React.createElement('div', { key: d.id, onClick: () => onEdit && onEdit(d), style: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 13, display: 'flex', gap: 12, alignItems: 'center', border: '1px solid var(--line)', boxShadow: 'var(--shadow)', cursor: 'pointer' } },
                React.createElement('div', { style: { fontSize: 30 } }, m.emoji),
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('h3', { style: { margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--ink)' } }, d.name),
                  React.createElement('div', { style: { fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 } },
                    d.cuisine ? window.cuisineOf(d.cuisine).label : '自填',
                    d.cost != null ? ' · $' + d.cost : ' · 點此補金額',
                    d.note ? ' · ' + d.note : ''
                  )
                ),
                React.createElement('span', { style: { color: 'var(--ink-faint)', display: 'inline-flex', padding: 4 } }, React.createElement(Icons.chevR, { size: 18 }))
              );
            })
          )
        ))
      )
    )
  );
}

window.Diary = Diary;
window.LogSheet = LogSheet;
window.DiaryEditSheet = DiaryEditSheet;
window.MOODS = MOODS;
