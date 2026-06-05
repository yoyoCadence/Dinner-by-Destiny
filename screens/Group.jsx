/* 和朋友一起骰 — 共享清單投票 */
const { Icons } = window;
const { useState, useEffect, useRef } = React;

function pickThreeG(restaurants, radius) {
  const pool = restaurants.map((r) => ({ r, dist: window.distM(window.HOME_LOC, r) }))
    .filter(({ r, dist }) => dist <= radius && !window.isSnoozed(r));
  const a = pool.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, Math.min(3, a.length));
}

const secT = { fontSize: 13, fontWeight: 800, color: 'var(--ink)', margin: '0 0 11px' };
const btnP = { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 15.5, fontWeight: 800, cursor: 'pointer' };
const btnS = { flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 15, fontWeight: 700, cursor: 'pointer' };

function Group({ store, onClose, onPick }) {
  const { state } = store;
  const { radius } = state.settings;
  const [stage, setStage] = useState('lobby');
  const [joined, setJoined] = useState(state.friends.map((f) => f.id));
  const [cands, setCands] = useState([]);
  const [votes, setVotes] = useState({});
  const me = { id: 'me', name: '我', emoji: '🧑' };
  const voters = [me, ...state.friends.filter((f) => joined.includes(f.id))];
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const start = () => {
    const c = pickThreeG(state.restaurants, radius);
    if (c.length < 2) { alert('此範圍可選餐廳太少，先到探索頁拉大範圍'); return; }
    setCands(c); setVotes({}); setStage('vote');
    state.friends.filter((f) => joined.includes(f.id)).forEach((f, i) => {
      timers.current.push(setTimeout(() => {
        const weights = c.map(({ r }) => r.rating * 2 + (12 - Math.min(12, r.eatCount)) * 0.3 + Math.random() * 3);
        let idx = 0; weights.forEach((w, k) => { if (w > weights[idx]) idx = k; });
        setVotes((v) => ({ ...v, [f.id]: idx }));
      }, 700 + i * 800 + Math.random() * 500));
    });
  };

  const myVote = votes['me'];
  const allVoted = voters.every((v) => votes[v.id] != null);

  useEffect(() => {
    if (stage === 'vote' && allVoted) {
      const t = setTimeout(() => setStage('done'), 700);
      return () => clearTimeout(t);
    }
  }, [stage, allVoted]);

  const tally = cands.map((_, i) => voters.filter((v) => votes[v.id] === i).length);
  const maxV = Math.max(0, ...tally);
  const winners = tally.map((t, i) => (t === maxV && maxV > 0 ? i : -1)).filter((i) => i >= 0);
  const winner = winners.length ? cands[winners[Math.floor(Math.random() * winners.length)]] : null;

  const lobbyContent = React.createElement('div', null,
    React.createElement('p', { style: { fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, margin: '0 0 16px' } },
      '選好要一起的朋友，骰出 3 家候選，大家各投一票，最高票出線！平手就由骰子決定。'
    ),
    React.createElement('p', { style: secT }, '誰要一起？'),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', background: 'var(--accent-soft)', borderRadius: 13, border: '1.5px solid var(--accent)' } },
        React.createElement('span', { style: { fontSize: 24 } }, '🧑'),
        React.createElement('span', { style: { flex: 1, fontSize: 15, fontWeight: 800, color: 'var(--ink)' } }, '我'),
        React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: 'var(--accent)' } }, '主揪')
      ),
      state.friends.map((f) => {
        const on = joined.includes(f.id);
        return React.createElement('button', { key: f.id, onClick: () => setJoined((j) => on ? j.filter((x) => x !== f.id) : [...j, f.id]), style: { display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderRadius: 13, cursor: 'pointer', border: '1.5px solid ' + (on ? 'var(--accent)' : 'var(--line)'), background: on ? 'var(--surface)' : 'var(--surface-2)' } },
          React.createElement('span', { style: { fontSize: 24, opacity: on ? 1 : .5 } }, f.emoji),
          React.createElement('span', { style: { flex: 1, textAlign: 'left', fontSize: 15, fontWeight: 700, color: on ? 'var(--ink)' : 'var(--ink-faint)' } }, f.name),
          React.createElement('span', { style: { width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', background: on ? 'var(--accent)' : 'transparent', color: 'var(--accent-ink)', border: on ? 'none' : '2px solid var(--line)' } }, on && React.createElement(Icons.check, { size: 15 }))
        );
      })
    ),
    React.createElement('button', { onClick: start, style: btnP },
      React.createElement(Icons.dice, { size: 20 }),
      '開始揪團骰（' + voters.length + ' 人）'
    )
  );

  const voteContent = React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14 } },
      voters.map((v) => React.createElement('div', { key: v.id, style: { textAlign: 'center', opacity: votes[v.id] != null ? 1 : .4, transition: 'opacity .3s' } },
        React.createElement('div', { style: { fontSize: 26, position: 'relative' } },
          v.emoji,
          votes[v.id] != null && React.createElement('span', { style: { position: 'absolute', bottom: -2, right: -4, fontSize: 13 } }, '✅')
        ),
        React.createElement('div', { style: { fontSize: 10.5, fontWeight: 700, color: 'var(--ink-soft)' } }, v.name)
      ))
    ),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
      cands.map((c, i) => {
        const { r, dist } = c;
        const cz = window.cuisineOf(r.cuisine);
        const voters2 = voters.filter((v) => votes[v.id] === i);
        const isWin = stage === 'done' && winner && winner.r.id === r.id;
        return React.createElement('button', { key: r.id, disabled: stage === 'done' || myVote != null, onClick: () => setVotes((v) => ({ ...v, me: i })), style: { textAlign: 'left', padding: 13, borderRadius: 16, cursor: stage === 'done' || myVote != null ? 'default' : 'pointer', border: '2px solid ' + (isWin ? 'var(--gold)' : myVote === i ? 'var(--accent)' : 'var(--line)'), background: isWin ? 'var(--accent-soft)' : 'var(--surface)', boxShadow: isWin ? '0 10px 26px -10px var(--gold)' : 'none', position: 'relative', transform: isWin ? 'scale(1.02)' : 'none', transition: 'all .3s' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            React.createElement('span', { style: { fontSize: 26 } }, cz.emoji),
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } },
                React.createElement('h3', { style: { margin: 0, fontSize: 16.5, fontWeight: 800, color: 'var(--ink)' } }, r.name),
                isWin && React.createElement('span', { style: { fontSize: 18 } }, '👑')
              ),
              React.createElement('div', { style: { fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 } },
                cz.label + ' · ' + '$'.repeat(r.price) + ' · ' + window.fmtDist(dist) + ' · 吃過 ' + r.eatCount + ' 次'
              )
            ),
            React.createElement('div', { style: { textAlign: 'center', minWidth: 30 } },
              React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: tally[i] ? 'var(--accent)' : 'var(--ink-faint)', fontFamily: 'var(--font-display)' } }, tally[i]),
              React.createElement('div', { style: { fontSize: 9.5, color: 'var(--ink-faint)', fontWeight: 700 } }, '票')
            )
          ),
          voters2.length > 0 && React.createElement('div', { style: { display: 'flex', gap: 3, marginTop: 8, paddingLeft: 36 } },
            voters2.map((v) => React.createElement('span', { key: v.id, style: { fontSize: 16 } }, v.emoji))
          )
        );
      })
    ),
    stage === 'vote' && myVote == null && React.createElement('p', { style: { textAlign: 'center', fontSize: 13.5, color: 'var(--accent)', fontWeight: 700, marginTop: 14 } }, '👆 換你投票！'),
    stage === 'vote' && myVote != null && !allVoted && React.createElement('p', { style: { textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)', marginTop: 14 } }, '等朋友投票中…'),
    stage === 'done' && winner && React.createElement('div', { style: { marginTop: 16, textAlign: 'center' } },
      React.createElement('p', { style: { fontSize: 15, fontWeight: 800, color: 'var(--ink)', margin: '0 0 12px' } }, '🎉 出線的是「' + winner.r.name + '」！'),
      React.createElement('div', { style: { display: 'flex', gap: 9 } },
        React.createElement('button', { onClick: () => { setStage('lobby'); setVotes({}); }, style: btnS }, '重來'),
        React.createElement('button', { onClick: () => { onPick(winner); onClose(); }, style: { ...btnP, flex: 2 } }, '就吃這家！')
      )
    )
  );

  return React.createElement('div', { style: { padding: '4px 20px 26px' } },
    stage === 'lobby' ? lobbyContent : voteContent
  );
}

window.Group = Group;
