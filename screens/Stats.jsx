/* 統計頁 — 本月吃最多/最少、花費、口味分布 */
const { Icons } = window;
const { useMemo } = React;

function Bar({ label, emoji, value, max, accent }) {
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
    React.createElement('div', { style: { width: 86, fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 } },
      emoji && React.createElement('span', null, emoji),
      React.createElement('span', { style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, label)
    ),
    React.createElement('div', { style: { flex: 1, height: 22, background: 'var(--surface-2)', borderRadius: 8, overflow: 'hidden', position: 'relative' } },
      React.createElement('div', { style: { width: max ? (value / max * 100) + '%' : 0, height: '100%', background: accent || 'var(--accent)', borderRadius: 8, transition: 'width .6s cubic-bezier(.2,.9,.3,1)', minWidth: value ? 6 : 0 } })
    ),
    React.createElement('div', { style: { width: 30, textAlign: 'right', fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)', flexShrink: 0 } }, value)
  );
}

function StatCard({ children, title }) {
  return React.createElement('div', { style: { background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow)' } },
    title && React.createElement('h3', { style: { margin: '0 0 13px', fontSize: 15, fontWeight: 800, color: 'var(--ink)' } }, title),
    children
  );
}

function Empty() {
  return React.createElement('p', { style: { margin: 0, fontSize: 13, color: 'var(--ink-faint)', textAlign: 'center', padding: '12px 0' } }, '本月還沒紀錄，去日記記一餐吧');
}

function Stats({ store }) {
  const { state } = store;
  const month = window.todayStr().slice(0, 7);
  const monthEntries = state.diary.filter((d) => d.date.startsWith(month));

  const totalCost = monthEntries.reduce((s, d) => s + (d.cost || 0), 0);
  const avgCost = monthEntries.filter((d) => d.cost).length ? Math.round(totalCost / monthEntries.filter((d) => d.cost).length) : 0;

  // 本月吃最多/最少（依日記）
  const byName = {};
  monthEntries.forEach((d) => { byName[d.name] = (byName[d.name] || 0) + 1; });
  const ranked = Object.entries(byName).sort((a, b) => b[1] - a[1]);
  const most = ranked.slice(0, 5);

  // 料理類型分布（用累積總吃過次數）
  const byCuisine = {};
  state.restaurants.forEach((r) => { byCuisine[r.cuisine] = (byCuisine[r.cuisine] || 0) + (r.eatCount || 0); });
  const cuisineArr = Object.entries(byCuisine).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const cuisineMax = Math.max(1, ...cuisineArr.map((x) => x[1]));

  // 心情分布
  const byMood = {};
  state.diary.forEach((d) => { byMood[d.mood] = (byMood[d.mood] || 0) + 1; });
  const moodTotal = state.diary.length || 1;

  // 最久沒吃（被冷落）
  const neglected = state.restaurants.slice().sort((a, b) => window.daysAgo(b.lastEaten) - window.daysAgo(a.lastEaten)).slice(0, 3);

  const KPI = ({ n, label, sub }) => React.createElement('div', { style: { flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px 12px', border: '1px solid var(--line)', boxShadow: 'var(--shadow)', textAlign: 'center' } },
    React.createElement('div', { style: { fontSize: 26, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-display)', lineHeight: 1 } }, n),
    React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: 'var(--ink)', marginTop: 5 } }, label),
    sub && React.createElement('div', { style: { fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 1 } }, sub)
  );

  const kpiSection = React.createElement('div', { style: { display: 'flex', gap: 10 } },
    React.createElement(KPI, { n: monthEntries.length, label: '本月用餐', sub: '筆紀錄' }),
    React.createElement(KPI, { n: '$' + totalCost, label: '本月花費', sub: '平均 $' + avgCost + '/餐' }),
    React.createElement(KPI, { n: ranked.length, label: '不同餐廳', sub: '本月造訪' })
  );

  const topEatenSection = React.createElement(StatCard, { title: '🏆 本月吃最多' },
    most.length === 0 ? React.createElement(Empty, null) : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
      most.map(([name, n], i) => React.createElement(Bar, { key: name, label: name, emoji: ['🥇', '🥈', '🥉', '·', '·'][i], value: n, max: most[0][1] }))
    )
  );

  const cuisineSection = React.createElement(StatCard, { title: '🍱 口味分布（累計吃過次數）' },
    cuisineArr.length === 0 ? React.createElement(Empty, null) : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
      cuisineArr.map(([key, v], i) => {
        const cz = window.cuisineOf(key);
        return React.createElement(Bar, { key: key, label: cz.label, emoji: cz.emoji, value: v, max: cuisineMax, accent: `oklch(0.7 0.13 ${40 + i * 45})` });
      })
    )
  );

  const moodBars = window.MOODS.map((m) => {
    const v = byMood[m.key] || 0;
    if (!v) return null;
    return React.createElement('div', { key: m.key, title: m.label, style: { width: (v / moodTotal * 100) + '%', background: { love: '#FF7AA2', good: 'var(--gold)', ok: '#7FC7A0', meh: '#9FB0C2', bad: '#C98A8A' }[m.key], display: 'grid', placeItems: 'center', fontSize: 10 } }, v >= moodTotal * 0.12 ? m.emoji : '');
  });

  const moodLegend = React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 } },
    window.MOODS.map((m) => React.createElement('span', { key: m.key, style: { fontSize: 11.5, color: 'var(--ink-soft)', fontWeight: 700 } }, m.emoji + ' ' + m.label + ' ' + (byMood[m.key] || 0)))
  );

  const moodSection = React.createElement(StatCard, { title: '😋 心情比例' },
    React.createElement('div', null,
      React.createElement('div', { style: { display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden', gap: 2 } }, moodBars),
      moodLegend
    )
  );

  const neglectedSection = React.createElement(StatCard, { title: '🕸️ 最久沒光顧（該換它了）' },
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 9 } },
      neglected.map((r) => React.createElement('div', { key: r.id, style: { display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement('span', { style: { fontSize: 20 } }, window.cuisineOf(r.cuisine).emoji),
        React.createElement('span', { style: { flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--ink)' } }, r.name),
        React.createElement('span', { style: { fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700 } }, window.fmtAgo(r.lastEaten))
      ))
    )
  );

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
    React.createElement('div', { style: { padding: '6px 18px 10px', flexShrink: 0 } },
      React.createElement('h1', { style: { margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' } }, '飲食統計'),
      React.createElement('p', { style: { margin: '2px 0 0', fontSize: 13, color: 'var(--ink-soft)' } }, month.replace('-', ' 年 ') + ' 月 · 累計總覽')
    ),
    React.createElement('div', { style: { flex: 1, overflowY: 'auto', padding: '4px 18px 24px', display: 'flex', flexDirection: 'column', gap: 13 } },
      kpiSection,
      topEatenSection,
      cuisineSection,
      moodSection,
      neglectedSection
    )
  );
}

window.Stats = Stats;
