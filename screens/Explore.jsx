/* 探索頁 — 搜尋、距離排序、半徑滑桿、三種排版 */
const { Stars, PriceTag, EatBadge, Chip, Icons } = window;
const { useState, useMemo } = React;

function imgPlaceholder(r, h) {
  const cz = window.cuisineOf(r.cuisine);
  return React.createElement('div', { style: { height: h, borderRadius: 14, flexShrink: 0, position: 'relative', overflow: 'hidden', background: 'repeating-linear-gradient(135deg, var(--surface-2) 0 10px, var(--accent-soft) 10px 20px)', display: 'grid', placeItems: 'center' } },
    React.createElement('span', { style: { fontSize: h > 90 ? 40 : 28, filter: 'saturate(.9)' } }, cz.emoji),
    React.createElement('span', { style: { position: 'absolute', bottom: 6, right: 8, fontSize: 9, fontFamily: 'ui-monospace,monospace', color: 'var(--ink-faint)', letterSpacing: '.5px' } }, '店景照')
  );
}

function MapsBtn({ r }) {
  return React.createElement('button', { onClick: (e) => { e.stopPropagation(); window.openMaps(r); }, style: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, padding: '6px 11px', borderRadius: 999, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--accent)', cursor: 'pointer' } },
    React.createElement(Icons.nav, { size: 13 }),
    ' 導航'
  );
}

function CardRow({ r, dist, onOpen }) {
  const cz = window.cuisineOf(r.cuisine);
  const snoozed = window.isSnoozed(r);
  return React.createElement('div', { onClick: () => onOpen(r), style: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 12, display: 'flex', gap: 12, boxShadow: 'var(--shadow)', border: '1px solid var(--line)', cursor: 'pointer', opacity: snoozed ? .55 : 1 } },
    React.createElement('div', { style: { width: 84 } }, imgPlaceholder(r, 84)),
    React.createElement('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 } },
        React.createElement('h3', { style: { margin: 0, fontSize: 16.5, fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, r.name),
        React.createElement('span', { style: { fontSize: 12, color: 'var(--ink-soft)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3 } },
          React.createElement(Icons.pin, { size: 12 }),
          window.fmtDist(dist)
        )
      ),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--ink-soft)' } },
        React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 3 } }, cz.emoji, cz.label),
        React.createElement(PriceTag, { p: r.price }),
        React.createElement(Stars, { value: r.rating })
      ),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto' } },
        React.createElement(EatBadge, { n: r.eatCount }),
        snoozed ? React.createElement('span', { style: { fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 700 } }, '😮‍💨 暫時跳過') : React.createElement(MapsBtn, { r: r })
      )
    )
  );
}

function CompactRow({ r, dist, onOpen }) {
  const cz = window.cuisineOf(r.cuisine);
  const snoozed = window.isSnoozed(r);
  return React.createElement('div', { onClick: () => onOpen(r), style: { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--line)', opacity: snoozed ? .5 : 1 } },
    React.createElement('div', { style: { width: 38, height: 38, borderRadius: 11, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', fontSize: 19, flexShrink: 0 } }, cz.emoji),
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', gap: 7 } },
        React.createElement('h3', { style: { margin: 0, fontSize: 15.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, r.name),
        React.createElement(PriceTag, { p: r.price })
      ),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 } },
        React.createElement('span', null, React.createElement(Icons.pin, { size: 11 }), ' ', window.fmtDist(dist)),
        React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 2 } }, React.createElement(Icons.walk, { size: 11 }), window.walkMin(dist), ' 分'),
        React.createElement('span', { style: { color: 'var(--ink-faint)' } }, '·'),
        React.createElement('span', null, '吃過 ', r.eatCount, ' 次')
      )
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gold)', fontSize: 13, fontWeight: 800 } },
      React.createElement(Icons.star, { size: 13 }),
      r.rating.toFixed(1)
    )
  );
}

function MagCard({ r, dist, onOpen, big }) {
  const cz = window.cuisineOf(r.cuisine);
  const snoozed = window.isSnoozed(r);
  return React.createElement('div', { onClick: () => onOpen(r), style: { background: 'var(--surface)', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow)', border: '1px solid var(--line)', gridColumn: big ? 'span 2' : 'span 1', opacity: snoozed ? .55 : 1, display: 'flex', flexDirection: 'column' } },
    React.createElement('div', { style: { position: 'relative' } },
      imgPlaceholder(r, big ? 132 : 96),
      React.createElement('div', { style: { position: 'absolute', top: 8, left: 8 } }, React.createElement(EatBadge, { n: r.eatCount, accent: true }))
    ),
    React.createElement('div', { style: { padding: big ? '12px 14px' : '10px 11px', display: 'flex', flexDirection: 'column', gap: 4 } },
      React.createElement('h3', { style: { margin: 0, fontSize: big ? 18 : 14.5, fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, r.name),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--ink-soft)', flexWrap: 'wrap' } },
        React.createElement('span', null, cz.emoji, cz.label),
        React.createElement(PriceTag, { p: r.price }),
        React.createElement('span', null, React.createElement(Icons.pin, { size: 11 }), window.fmtDist(dist))
      ),
      big && React.createElement('p', { style: { margin: '2px 0 0', fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 } }, r.blurb)
    )
  );
}

function Explore({ store, onOpen }) {
  const { state } = store;
  const { radius, layout, city, noRadius, cuisine } = state.settings;
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('dist');

  const withDist = useMemo(() => state.restaurants.map((r) => ({ r, dist: window.distM(window.HOME_LOC, r) })), [state.restaurants]);

  const list = useMemo(() => {
    let arr = withDist.filter(({ r, dist }) => {
      if (!noRadius && dist > radius) return false;
      if (city !== 'all' && r.city !== city) return false;
      if (cuisine !== 'all' && r.cuisine !== cuisine) return false;
      if (q && !(r.name.includes(q) || (r.tags || []).some((t) => t.includes(q)) || window.cuisineOf(r.cuisine).label.includes(q))) return false;
      return true;
    });
    arr.sort((a, b) => {
      if (sort === 'rating') return b.r.rating - a.r.rating;
      if (sort === 'least') return (a.r.eatCount || 0) - (b.r.eatCount || 0);
      return a.dist - b.dist;
    });
    return arr;
  }, [withDist, radius, noRadius, city, cuisine, q, sort]);

  const cuisinesPresent = useMemo(() => {
    const set = new Set(withDist.filter((x) => (noRadius || x.dist <= radius) && (city === 'all' || x.r.city === city)).map((x) => x.r.cuisine));
    return window.CUISINES.filter((c) => set.has(c.key));
  }, [withDist, radius, noRadius, city]);

  const listRender = (() => {
    if (list.length === 0) {
      return React.createElement('div', { style: { textAlign: 'center', padding: '48px 24px', color: 'var(--ink-faint)' } },
        React.createElement('div', { style: { fontSize: 40, marginBottom: 8 } }, '🤔'),
        '沒有符合的餐廳',
        React.createElement('br', null),
        '試著切換城市、打開「不限距離」或清除篩選'
      );
    }
    if (layout === 'card') {
      return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        list.map(({ r, dist }) => React.createElement(CardRow, { key: r.id, r: r, dist: dist, onOpen: onOpen }))
      );
    }
    if (layout === 'compact') {
      return React.createElement('div', { style: { background: 'var(--surface)', borderTop: '1px solid var(--line)' } },
        list.map(({ r, dist }) => React.createElement(CompactRow, { key: r.id, r: r, dist: dist, onOpen: onOpen }))
      );
    }
    if (layout === 'magazine') {
      return React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
        list.map(({ r, dist }, i) => React.createElement(MagCard, { key: r.id, r: r, dist: dist, onOpen: onOpen, big: i === 0 }))
      );
    }
  })();

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
    React.createElement('div', { style: { padding: '6px 18px 10px', flexShrink: 0 } },
      React.createElement('div', { style: { fontSize: 12, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 } },
        React.createElement(Icons.pin, { size: 13 }),
        window.HOME_LOC.label
      ),
      React.createElement('h1', { style: { margin: '2px 0 0', fontSize: 26, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' } }, '今晚吃哪間？')
    ),
    React.createElement('div', { style: { padding: '0 18px 10px', flexShrink: 0 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: 14, padding: '10px 13px' } },
        React.createElement(Icons.search, { size: 18, color: 'var(--ink-faint)' }),
        React.createElement('input', { value: q, onChange: (e) => setQ(e.target.value), placeholder: '搜尋店名、料理、標籤…', style: { border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--font)' } }),
        q && React.createElement('button', { onClick: () => setQ(''), style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)' } }, React.createElement(Icons.close, { size: 16 }))
      )
    ),
    React.createElement(window.HScroll, { style: { padding: '0 18px 10px', flexShrink: 0 } },
      React.createElement(Chip, { active: city === 'all', onClick: () => store.setSetting('city', 'all') }, '全部城市'),
      window.CITIES.map((c) => React.createElement(Chip, { key: c, active: city === c, onClick: () => store.setSetting('city', c) }, c))
    ),
    React.createElement('div', { style: { padding: '0 18px 8px', flexShrink: 0 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 6 } },
        noRadius
          ? React.createElement('span', null, '不限距離 · ', React.createElement('b', { style: { color: 'var(--accent)' } }, list.length), ' 家')
          : React.createElement('span', null, '距家 ', React.createElement('b', { style: { color: 'var(--accent)' } }, (radius / 1000).toFixed(1), ' km'), ' 內 · ', list.length, ' 家'),
        React.createElement('button', { onClick: () => store.setSetting('noRadius', !noRadius), style: { fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999, border: '1.5px solid var(--line)', background: noRadius ? 'var(--accent)' : 'var(--surface)', color: noRadius ? 'var(--accent-ink)' : 'var(--ink)', cursor: 'pointer' } }, noRadius ? '✓ 不限距離' : '限制距離')
      ),
      !noRadius && React.createElement('input', { type: 'range', min: '300', max: '5000', step: '100', value: radius, onChange: (e) => store.setSetting('radius', +e.target.value), className: 'radslider', style: { width: '100%' } }),
      React.createElement('div', { style: { marginTop: noRadius ? 0 : 8 } },
        React.createElement(window.SegBar, { small: true, value: sort, onChange: setSort, options: [{ value: 'dist', label: '距離近' }, { value: 'rating', label: '評分高' }, { value: 'least', label: '吃最少' }] })
      )
    ),
    React.createElement(window.HScroll, { style: { padding: '4px 18px 12px', flexShrink: 0 } },
      React.createElement(Chip, { active: cuisine === 'all', onClick: () => store.setSetting('cuisine', 'all') }, '全部'),
      cuisinesPresent.map((c) => React.createElement(Chip, { key: c.key, emoji: c.emoji, active: cuisine === c.key, onClick: () => store.setSetting('cuisine', c.key) }, c.label))
    ),
    React.createElement('div', { style: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: layout === 'compact' ? '0' : '0 18px 24px' } }, listRender)
  );
}

window.Explore = Explore;
