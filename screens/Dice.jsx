/* 骰子頁面 — 骰子、拉霸、抽卡 + 結果卡片 */
const { Icons } = window;
const { useState, useMemo, useEffect } = React;

// 結果卡片 — 統一顯示中獎餐廳
function ResultCard({ item, onConfirm, onRetry, diceStyle }) {
  const { r, dist } = item;
  const cz = window.cuisineOf(r.cuisine);
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 20, gap: 16 } },
    React.createElement('div', { style: { fontSize: 80, marginBottom: 10 } }, '🎉'),
    React.createElement('h2', { style: { margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--ink)', textAlign: 'center' } }, r.name),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--ink-soft)' } },
      React.createElement('span', null, cz.emoji + ' ' + cz.label),
      React.createElement('span', null, '·'),
      React.createElement('span', null, '$'.repeat(r.price)),
      React.createElement('span', null, '·'),
      React.createElement('span', null, window.fmtDist(dist))
    ),
    React.createElement('div', { style: { display: 'flex', gap: 12, width: '100%' } },
      React.createElement('button', { onClick: onRetry, style: { flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 15, fontWeight: 700, cursor: 'pointer' } }, diceStyle === 'slot' ? '再拉一次' : diceStyle === 'card' ? '再抽一張' : '再骰一次'),
      React.createElement('button', { onClick: onConfirm, style: { flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 15, fontWeight: 800, cursor: 'pointer' } }, '就吃這家')
    )
  );
}

// 進場包裝 — 基礎 opacity 恆為 1，只用 transform 做淡入位移（靜態擷取也可見）
function RevealFade({ children }) {
  return React.createElement('div', { className: 'reveal-up', style: { height: '100%' } }, children);
}

// 三選一結果視圖 — 骰子 / 拉霸 / 抽卡 共用
function ThreePick({ cards, onPick, onAgain, title, againLabel }) {
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 18, padding: 16 } },
    React.createElement('h2', { style: { margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--ink)', textAlign: 'center' } }, title),
    React.createElement('div', { style: { display: 'flex', gap: 10, width: '100%', alignItems: 'stretch' } },
      cards.map(function (c, i) { return React.createElement(CardFace, { key: c.r.id, item: c, onPick: onPick, delay: i * 90 }); })
    ),
    React.createElement('button', { onClick: onAgain, style: { padding: '12px 22px', borderRadius: 14, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontWeight: 700, cursor: 'pointer' } }, againLabel)
  );
}

// 骰子模式 — 真正的 3D 立方體滾動，停下淡出骰子、淡入中選餐廳
function DiceMode({ cands, deal, onResult }) {
  const [phase, setPhase] = useState('idle'); // idle | rolling | fading | reveal
  const [picks, setPicks] = useState(null);
  const faces = useMemo(function () {
    const pool = cands.map(emojiOf).concat(SLOT_FILLER);
    const f = [];
    for (let i = 0; i < 6; i++) f.push(pool[i % pool.length]);
    return f;
  }, [cands]);

  const busy = phase === 'rolling' || phase === 'fading';
  const roll = function () {
    if (busy) return;
    setPicks(null);
    setPhase('rolling');
    const chosen = deal(3);
    setTimeout(function () {
      setPicks(chosen);
      setPhase('fading');
      setTimeout(function () { setPhase('reveal'); }, 320);
    }, 1300);
  };

  if (phase === 'reveal' && picks) {
    return React.createElement(RevealFade, null,
      React.createElement(ThreePick, { cards: picks, onPick: onResult, onAgain: roll, title: '🎉 骰出三家，挑一家', againLabel: '🎲 再骰一次' })
    );
  }

  const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 30, padding: 20 } },
    React.createElement('div', { className: 'dice3d-scene', style: { opacity: phase === 'fading' ? 0 : 1, transition: 'opacity .3s ease' } },
      React.createElement('div', { className: 'dice3d ' + (phase === 'rolling' ? 'rolling' : 'resting') },
        faceNames.map(function (fn, i) { return React.createElement('div', { key: fn, className: 'face face-' + fn }, faces[i]); })
      )
    ),
    React.createElement('h2', { style: { margin: 0, fontSize: 23, fontWeight: 800, color: 'var(--ink)' } }, phase === 'rolling' ? '骰子滾動中…' : '現在就骰！'),
    React.createElement('button', { onClick: roll, disabled: busy, style: { padding: '16px 34px', borderRadius: 16, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 18, fontWeight: 800, cursor: busy ? 'wait' : 'pointer', boxShadow: 'var(--shadow)', opacity: busy ? 0.6 : 1 } }, '🎲 骰一下')
  );
}

// 拉霸模式 — 真正的垂直轉軸拉霸機
var SLOT_ITEM_H = 92;          // 每個符號高度
var SLOT_STRIP = 32;           // 每條轉軸符號數
var SLOT_FILLER = ['🍜','🍣','🍕','🍔','🍱','🍛','🥘','🍲','🌮','🥟','🍤','🍙','🥗','🍝'];

function emojiOf(c) { return window.cuisineOf(c.r.cuisine).emoji || '🍽️'; }

function SlotMode({ cands, deal, onResult }) {
  const [phase, setPhase] = useState('idle');   // idle | spinning | done
  const [picks, setPicks] = useState(null);
  const [strips, setStrips] = useState(function () {
    // 初始靜態三軸，中央顯示候選 emoji
    return [0, 1, 2].map(function (i) {
      var arr = [];
      for (var k = 0; k < SLOT_STRIP; k++) arr.push(SLOT_FILLER[(k + i) % SLOT_FILLER.length]);
      arr[SLOT_STRIP - 1] = emojiOf(cands[i % cands.length]);
      return arr;
    });
  });
  const [offsets, setOffsets] = useState([0, 0, 0]);
  const [animate, setAnimate] = useState(false);
  const [lever, setLever] = useState(false);

  const pull = function () {
    if (phase === 'spinning') return;
    setLever(true);
    setTimeout(function () { setLever(false); }, 350);

    var chosen = deal(3);
    var pool = cands.map(emojiOf).concat(SLOT_FILLER);

    var newStrips = [0, 1, 2].map(function (i) {
      var arr = [];
      for (var k = 0; k < SLOT_STRIP - 1; k++) arr.push(pool[Math.floor(Math.random() * pool.length)]);
      arr.push(emojiOf(chosen[i % chosen.length]));   // 每軸停在一家，共三家
      return arr;
    });

    // 先無動畫歸零
    setAnimate(false);
    setStrips(newStrips);
    setOffsets([0, 0, 0]);
    setPicks(null);
    setPhase('spinning');

    // 下兩幀後開啟動畫並捲到底
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        setAnimate(true);
        setOffsets(newStrips.map(function (s) { return -((s.length - 1) * SLOT_ITEM_H); }));
      });
    });

    setTimeout(function () {
      setPicks(chosen);
      setPhase('done');
    }, 2250);
  };

  if (picks) {
    return React.createElement(ThreePick, { cards: picks, onPick: onResult, onAgain: pull, title: '🎰 轉出三家，挑一家', againLabel: '🎰 再拉一次' });
  }

  var durations = ['1.3s', '1.65s', '2.0s'];

  var reels = [0, 1, 2].map(function (i) {
    return React.createElement('div', {
      key: i,
      style: { width: 78, height: SLOT_ITEM_H, borderRadius: 10, overflow: 'hidden', position: 'relative', background: 'linear-gradient(var(--surface), color-mix(in srgb, var(--surface) 88%, #000))', border: '2px solid var(--line)', boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,.5), inset 0 -8px 12px -8px rgba(0,0,0,.5)' }
    },
      React.createElement('div', {
        style: {
          position: 'absolute', top: 0, left: 0, right: 0,
          transform: 'translateY(' + offsets[i] + 'px)',
          transition: animate ? ('transform ' + durations[i] + ' cubic-bezier(.16,.84,.3,1)') : 'none'
        }
      },
        strips[i].map(function (em, k) {
          return React.createElement('div', { key: k, style: { height: SLOT_ITEM_H, display: 'grid', placeItems: 'center', fontSize: 44 } }, em);
        })
      )
    );
  });

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 22, padding: 20 } },
    // 機台
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 14 } },
      React.createElement('div', { style: { display: 'flex', gap: 8, padding: 14, borderRadius: 18, background: 'var(--accent)', boxShadow: '0 12px 30px rgba(0,0,0,.25)', position: 'relative' } },
        // 中央得獎線
        React.createElement('div', { style: { position: 'absolute', left: 6, right: 46, top: '50%', height: 2, background: 'rgba(255,255,255,.35)', transform: 'translateY(-1px)', pointerEvents: 'none', zIndex: 2 } }),
        reels
      ),
      // 拉桿
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', height: SLOT_ITEM_H + 28, justifyContent: 'flex-start' } },
        React.createElement('div', { style: { width: 8, height: 46, background: 'var(--line)', borderRadius: 4 } }),
        React.createElement('div', { style: { width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', border: '3px solid var(--surface)', boxShadow: 'var(--shadow)', transform: lever ? 'translateY(14px)' : 'translateY(0)', transition: 'transform .25s ease' } })
      )
    ),
    React.createElement('h2', { style: { margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--ink)' } }, phase === 'spinning' ? '轉軸中…' : '拉下把手！'),
    React.createElement('button', { onClick: pull, disabled: phase === 'spinning', style: { padding: '16px 34px', borderRadius: 16, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 18, fontWeight: 800, cursor: phase === 'spinning' ? 'wait' : 'pointer', boxShadow: 'var(--shadow)', opacity: phase === 'spinning' ? 0.6 : 1 } }, phase === 'spinning' ? '轉軸中…' : '🎰 拉把手')
  );
}

// 抽卡模式 — 一次發三張，挑你想吃的
function CardFace({ item, onPick, delay }) {
  const { r, dist } = item;
  const cz = window.cuisineOf(r.cuisine);
  return React.createElement('button', {
    onClick: function () { onPick(item); },
    className: 'deal-card',
    style: { flex: 1, minWidth: 0, border: '2px solid var(--line)', background: 'var(--surface)', borderRadius: 16, padding: '14px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow: 'var(--shadow)', fontFamily: 'var(--font)' }
  },
    React.createElement('div', { style: { fontSize: 38 } }, cz.emoji),
    React.createElement('div', { style: { fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.25 } }, r.name),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 3, color: 'var(--gold)', fontSize: 12, fontWeight: 800 } }, '★ ', r.rating.toFixed(1)),
    React.createElement('div', { style: { fontSize: 11, color: 'var(--ink-soft)' } }, '$'.repeat(r.price) + ' · ' + window.fmtDist(dist)),
    React.createElement('div', { style: { fontSize: 11, color: 'var(--ink-faint)' } }, r.city),
    React.createElement('div', { style: { marginTop: 4, fontSize: 11.5, fontWeight: 800, color: 'var(--accent)' } }, '選這家 →')
  );
}

// 翻牌：背面（🎴）先朝上，發牌落定後逐張翻開正面
function FlipCard({ item, flipped, selectable, onPick, dealDelay, flipDelay }) {
  const { r, dist } = item;
  const cz = window.cuisineOf(r.cuisine);
  // shown: 目前顯示哪一面（back / front）；spin: 是否正在翻
  const [shown, setShown] = useState('back');
  const [spinKey, setSpinKey] = useState(0);

  useEffect(function () {
    if (!flipped) { setShown('back'); return; }
    // 等 flipDelay 後開始翻；翻到一半（側面，約 260ms）瞬間換成正面
    const tStart = setTimeout(function () { setSpinKey(function (k) { return k + 1; }); }, flipDelay);
    const tSwap = setTimeout(function () { setShown('front'); }, flipDelay + 260);
    return function () { clearTimeout(tStart); clearTimeout(tSwap); };
  }, [flipped, flipDelay]);

  const faceBase = { position: 'absolute', inset: 0, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '12px 6px' };

  const frontFace = React.createElement('div', { style: Object.assign({}, faceBase, { background: 'var(--surface)', border: '2px solid ' + (selectable ? 'var(--accent)' : 'var(--line)'), boxShadow: 'var(--shadow)' }) },
    React.createElement('div', { style: { fontSize: 34 } }, cz.emoji),
    React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.2 } }, r.name),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', justifyContent: 'center', fontSize: 11.5, fontWeight: 700 } },
      React.createElement('span', { style: { color: 'var(--gold)' } }, '★ ' + r.rating.toFixed(1)),
      React.createElement('span', { style: { color: 'var(--ink-faint)' } }, '·'),
      React.createElement('span', { style: { color: 'var(--ink-soft)' } }, '$'.repeat(r.price))
    ),
    React.createElement('div', { style: { fontSize: 11, color: 'var(--ink-soft)' } }, window.fmtDist(dist) + ' · ' + r.city),
    selectable && React.createElement('div', { style: { marginTop: 3, fontSize: 11, fontWeight: 800, color: 'var(--accent)' } }, '選這家 →')
  );

  const backFace = React.createElement('div', { style: Object.assign({}, faceBase, { background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in oklab, var(--accent) 70%, #000) 100%)', border: '3px solid var(--surface)', boxShadow: 'var(--shadow)' }) },
    React.createElement('div', { style: { fontSize: 40, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.25))' } }, '🎴'),
    React.createElement('div', { style: { position: 'absolute', inset: 6, borderRadius: 12, border: '1.5px dashed rgba(255,255,255,.45)', pointerEvents: 'none' } })
  );

  return React.createElement('div', {
    onClick: function () { if (selectable && shown === 'front') onPick(item); },
    style: { flex: 1, minWidth: 0, height: 212, position: 'relative', cursor: (selectable && shown === 'front') ? 'pointer' : 'default', animation: 'dealIn .5s cubic-bezier(.2,.8,.3,1.2) both', animationDelay: dealDelay + 'ms' }
  },
    // 單一面（翻到側面時換內容），用 flipReveal 做立體翻轉
    React.createElement('div', {
      key: spinKey,
      className: spinKey > 0 ? 'flip-spin' : '',
      style: { position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }
    }, shown === 'front' ? frontFace : backFace)
  );
}

function CardMode({ deal, onResult }) {
  const [cards, setCards] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [round, setRound] = useState(0);

  const doDeal = function () {
    const picked = deal(3);
    setFlipped(false);
    setCards(picked && picked.length > 0 ? picked : []);
    setRound(function (n) { return n + 1; });
    setTimeout(function () { setFlipped(true); }, 720);
  };

  if (!cards || cards.length === 0) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 22, padding: 20 } },
      React.createElement('div', { style: { position: 'relative', width: 120, height: 132, display: 'grid', placeItems: 'center' } },
        [0, 1, 2, 3].map(function (i) {
          return React.createElement('div', { key: i, style: { position: 'absolute', width: 82, height: 116, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in oklab, var(--accent) 70%, #000) 100%)', border: '3px solid var(--surface)', display: 'grid', placeItems: 'center', fontSize: 30, boxShadow: '0 6px 16px rgba(0,0,0,.18)', transform: 'translate(' + (i * 3) + 'px,' + (i * -3) + 'px) rotate(' + (i * 2 - 3) + 'deg)' } }, i === 3 ? '🎴' : '');
        })
      ),
      React.createElement('h2', { style: { margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--ink)' } }, '抽三張，挑一家'),
      React.createElement('p', { style: { margin: 0, fontSize: 13, color: 'var(--ink-soft)' } }, '洗好牌了，準備發牌'),
      React.createElement('button', { onClick: doDeal, style: { padding: '16px 34px', borderRadius: 16, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 18, fontWeight: 800, cursor: 'pointer', boxShadow: 'var(--shadow)' } }, '🎴 發牌')
    );
  }

  return React.createElement('div', { key: round, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 18, padding: 16 } },
    React.createElement('h2', { style: { margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--ink)', textAlign: 'center' } }, flipped ? '🎴 挑一家你想吃的' : '發牌中…'),
    React.createElement('div', { style: { display: 'flex', gap: 10, width: '100%', alignItems: 'stretch', minHeight: 224 } },
      cards[0] && React.createElement(FlipCard, { key: '0', item: cards[0], flipped: flipped, selectable: flipped, onPick: onResult, dealDelay: 0, flipDelay: 120 }),
      cards[1] && React.createElement(FlipCard, { key: '1', item: cards[1], flipped: flipped, selectable: flipped, onPick: onResult, dealDelay: 130, flipDelay: 360 }),
      cards[2] && React.createElement(FlipCard, { key: '2', item: cards[2], flipped: flipped, selectable: flipped, onPick: onResult, dealDelay: 260, flipDelay: 600 })
    ),
    React.createElement('button', { onClick: doDeal, style: { padding: '12px 22px', borderRadius: 14, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: flipped ? 1 : 0.4, pointerEvents: flipped ? 'auto' : 'none', transition: 'opacity .3s' } }, '🔀 重新發牌')
  );
}

// 主 Dice 頁面
function Dice({ store, onPick, onGroup }) {
  const [stage, setStage] = useState('menu');
  const { diceStyle, city, noRadius, radius } = store.state.settings;

  const pool = useMemo(function () {
    return store.state.restaurants
      .map(function (r) { return { r: r, dist: window.distM(window.HOME_LOC, r) }; })
      .filter(function (x) { return (noRadius || x.dist <= radius) && (city === 'all' || x.r.city === city) && !window.isSnoozed(x.r); });
  }, [store.state.restaurants, city, noRadius, radius]);

  const shuffle = function (arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const deal = function (n) { return shuffle(pool).slice(0, n); };

  const handleResult = function (item) { onPick(item); setStage('menu'); };
  const cityLabel = city === 'all' ? '全部城市' : city;

  const header = React.createElement('div', { style: { padding: '12px 18px', flexShrink: 0, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 } },
    React.createElement('h1', { style: { margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap' } }, diceStyle === 'dice' ? '🎲 骰子' : diceStyle === 'slot' ? '🎰 拉霸' : '🎴 抽卡'),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
      React.createElement('select', { value: city, onChange: function (e) { store.setSetting('city', e.target.value); setStage('menu'); }, style: { fontSize: 13, fontWeight: 700, color: 'var(--ink)', background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: 999, padding: '6px 10px', fontFamily: 'var(--font)', cursor: 'pointer' } },
        [React.createElement('option', { key: 'all', value: 'all' }, '全部城市')].concat(window.CITIES.map(function (c) { return React.createElement('option', { key: c, value: c }, c); }))
      ),
      React.createElement('button', { onClick: function () { onGroup(); }, style: { background: 'none', border: 'none', color: 'var(--accent)', fontSize: 18, fontWeight: 700, cursor: 'pointer', padding: '4px' } }, '👥')
    )
  );

  if (pool.length === 0) {
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' } }, header,
      React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', gap: 12 } },
        React.createElement('span', { style: { fontSize: 72 } }, '😵'),
        React.createElement('h2', { style: { margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--ink)' } }, cityLabel + ' 沒有餐廳'),
        React.createElement('p', { style: { color: 'var(--ink-soft)', margin: 0, fontSize: 14, lineHeight: 1.6 } }, '換個城市，或到探索頁打開「不限距離」')
      )
    );
  }

  let playView = null;
  if (diceStyle === 'dice') playView = React.createElement(DiceMode, { cands: pool, deal: deal, onResult: handleResult });
  else if (diceStyle === 'slot') playView = React.createElement(SlotMode, { cands: pool, deal: deal, onResult: handleResult });
  else playView = React.createElement(CardMode, { deal: deal, onResult: handleResult });

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' } }, header,
    React.createElement('div', { style: { flex: 1, overflow: 'hidden' } },
      stage === 'menu'
        ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 18, padding: 20 } },
            React.createElement('div', { style: { fontSize: 84 } }, diceStyle === 'dice' ? '🎲' : diceStyle === 'slot' ? '🎰' : '🎴'),
            React.createElement('p', { style: { margin: 0, color: 'var(--ink-soft)', fontSize: 14, fontWeight: 600, textAlign: 'center' } }, '從 ' + cityLabel + ' 的 ' + pool.length + ' 家中，選出三家讓你挑'),
            React.createElement('button', { onClick: function () { setStage('play'); }, style: { padding: '18px 40px', borderRadius: 20, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' } }, diceStyle === 'dice' ? '🎲 開始骰' : diceStyle === 'slot' ? '🎰 進入拉霸' : '🎴 開始抽卡')
          )
        : playView
    )
  );
}

window.Dice = Dice;
window.emojiOf = emojiOf;
