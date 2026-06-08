const { Sheet } = window;
const { useState, useEffect, useRef } = React;

function TakeoutLink() {
  return React.createElement('a', { href: 'https://takeout.google.com', target: '_blank', rel: 'noopener noreferrer', style: { color: 'var(--accent)', fontWeight: 900, textDecoration: 'underline' } }, 'takeout.google.com');
}

function OnboardingSheet({ onStart, onImport, onClose }) {
  const stepStyle = { display: 'flex', gap: 12, padding: '13px 14px', borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--line)' };
  const badgeStyle = { width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', flexShrink: 0, background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 13, fontWeight: 900 };
  const titleStyle = { margin: '0 0 4px', fontSize: 14.5, fontWeight: 850, color: 'var(--ink)' };
  const textStyle = { margin: 0, fontSize: 12.8, color: 'var(--ink-soft)', lineHeight: 1.6 };
  const steps = [
    { n: '1', title: '先挑今天的範圍', text: '到「探索」點城市、距離或料理，候選清單會跟著縮小。' },
    { n: '2', title: '讓骰子抽三家', text: '骰子會直接套用探索範圍，抽出三家讓你挑。' },
    { n: '3', title: '換成你的常去清單', text: '之後可匯入 Google Maps 儲存、評論過的餐廳；可直接用 Takeout .zip。' },
  ];
  return React.createElement('div', { style: { padding: '4px 18px 22px', display: 'flex', flexDirection: 'column', gap: 14 } },
    React.createElement('div', { style: { padding: '18px 16px', borderRadius: 18, background: 'var(--accent-soft)', border: '1.5px solid var(--accent)' } },
      React.createElement('div', { style: { fontSize: 30, marginBottom: 8 } }, '🍽️'),
      React.createElement('h2', { style: { margin: '0 0 7px', fontSize: 21, fontWeight: 900, color: 'var(--ink)', fontFamily: 'var(--font-display)' } }, '今晚吃哪間？先讓命運幫你縮小選擇'),
      React.createElement('p', { style: { margin: 0, fontSize: 13.2, lineHeight: 1.65, color: 'var(--ink)' } }, '從一份餐廳清單開始，先選今天的範圍，再用骰子、拉霸或抽卡挑出幾個候選。')
    ),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 9 } },
      steps.map(function (s) {
        return React.createElement('div', { key: s.n, style: stepStyle },
          React.createElement('div', { style: badgeStyle }, s.n),
          React.createElement('div', null,
            React.createElement('p', { style: titleStyle }, s.title),
            React.createElement('p', { style: textStyle }, s.text)
          )
        );
      })
    ),
    React.createElement('div', { style: { padding: '13px 14px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--line)' } },
      React.createElement('p', { style: titleStyle }, 'Google Maps 匯出在哪裡？'),
      React.createElement('p', { style: textStyle }, '想放進自己的餐廳時，打開 ', React.createElement(TakeoutLink), ' → 建立新匯出 → 取消全選 → 只勾「地圖（你的地點）」，不要勾上方的「地圖」。')
    ),
    React.createElement('div', { style: { display: 'flex', gap: 10, paddingTop: 2 } },
      React.createElement('button', { onClick: onClose, style: { flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontWeight: 800, cursor: 'pointer' } }, '先逛逛'),
      React.createElement('button', { onClick: onStart, style: { flex: 1.4, padding: '14px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 14, fontWeight: 900, cursor: 'pointer' } }, '開始選今晚吃什麼')
    )
  );
}

function ImportPromptSheet({ onImport, onClose }) {
  const textStyle = { margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7 };
  return React.createElement('div', { style: { padding: '4px 18px 22px', display: 'flex', flexDirection: 'column', gap: 14 } },
    React.createElement('div', { style: { padding: '18px 16px', borderRadius: 18, background: 'var(--accent-soft)', border: '1.5px solid var(--accent)' } },
      React.createElement('div', { style: { fontSize: 30, marginBottom: 8 } }, '🎉'),
      React.createElement('h2', { style: { margin: '0 0 7px', fontSize: 21, fontWeight: 900, color: 'var(--ink)', fontFamily: 'var(--font-display)' } }, '玩法就是這樣'),
      React.createElement('p', { style: { margin: 0, fontSize: 13.2, lineHeight: 1.65, color: 'var(--ink)' } }, '接下來可以把候選餐廳換成你自己的 Google Maps 清單，之後每次打開都從熟悉的店裡挑。')
    ),
    React.createElement('div', { style: { padding: '13px 14px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--line)' } },
      React.createElement('p', { style: { margin: '0 0 4px', fontSize: 14.5, fontWeight: 850, color: 'var(--ink)' } }, '匯出資料'),
      React.createElement('p', { style: textStyle }, '打開 ', React.createElement(TakeoutLink), ' → 建立新匯出 → 取消全選 → 只勾「地圖（你的地點）」→ 下一步 → 建立匯出。下載後可直接匯入 .zip，也可以解壓縮後匯入「評論.json」和「已儲存的地點.json」。')
    ),
    React.createElement('div', { style: { display: 'flex', gap: 10, paddingTop: 2 } },
      React.createElement('button', { onClick: onClose, style: { flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontWeight: 800, cursor: 'pointer' } }, '先繼續逛'),
      React.createElement('button', { onClick: onImport, style: { flex: 1.3, padding: '14px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 14, fontWeight: 900, cursor: 'pointer' } }, '匯入我的餐廳')
    )
  );
}

window.DinnerApp = function App() {
  const store = window.useStore();
  const [tab, setTab] = useState('dice');
  const [detail, setDetail] = useState(null);
  const [logOpen, setLogOpen] = useState(false);
  const [logPreset, setLogPreset] = useState(null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(null); // explore | dice | import
  const [toast, setToast] = useState(null);
  const screenRef = useRef(null);

  const theme = store.state.settings.theme;
  useEffect(() => { if (screenRef.current) window.applyTheme(screenRef.current, theme); }, [theme]);

  const openDetail = r => setDetail(r);
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const pickToEat = item => {
    const r = item.r || item;
    setDetail(null); setGroupOpen(false);
    setLogPreset(r); setLogOpen(true);
    showToast('祝用餐愉快 🍽️ 順手記錄一下吧');
  };
  const openLog = r => { setDetail(null); setLogPreset(r || null); setLogOpen(true); };
  const needsOnboarding = (store.state.onboardingVersionSeen || 0) < (window.ONBOARDING_VERSION || 1);
  const closeOnboarding = () => { setOnboardingOpen(false); store.completeOnboarding(); };
  const startGuidedTry = () => { setOnboardingOpen(false); store.completeOnboarding(); setGuideStep('explore'); setTab('explore'); };
  const importFromOnboarding = () => { closeOnboarding(); setGuideStep(null); setTab('settings'); setImportOpen(true); };
  const closeImportPrompt = () => { setGuideStep(null); };

  const getDiceIcon = () => {
    const style = store.state.settings.diceStyle;
    return style === 'dice' ? '🎲' : style === 'slot' ? '🎰' : '🎴';
  };

  const styleBtns = ['dice', 'slot', 'card'].map(function (v) {
    const on = store.state.settings.diceStyle === v;
    const label = v === 'dice' ? '🎲 骰子' : v === 'slot' ? '🎰 拉霸' : '🎴 抽卡';
    return React.createElement('button', {
      key: v,
      onClick: function () { store.setSetting('diceStyle', v); },
      style: { flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid ' + (on ? 'var(--accent)' : 'var(--line)'), background: on ? 'var(--accent-soft)' : 'var(--surface)', color: 'var(--ink)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
    }, label);
  });

  let mainScreen = null;
  if (tab === 'explore') mainScreen = React.createElement(window.Explore, { store, onOpen: openDetail, guideActive: guideStep === 'explore', onGuideNext: () => { setGuideStep('dice'); setTab('dice'); }, onGuideSkip: () => setGuideStep(null) });
  else if (tab === 'dice') mainScreen = React.createElement(window.Dice, { store, onPick: pickToEat, onGroup: () => setGroupOpen(true), guideActive: guideStep === 'dice', onGuideDone: () => setGuideStep('import'), onGuideSkip: () => setGuideStep(null) });
  else if (tab === 'diary') mainScreen = React.createElement(window.Diary, { store, onAdd: () => openLog(null), onEdit: (d) => setEditEntry(d) });
  else if (tab === 'stats') mainScreen = React.createElement(window.Stats, { store });
  else if (tab === 'settings') mainScreen = React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' } },
    React.createElement('div', { style: { padding: '12px 18px', flexShrink: 0, borderBottom: '1px solid var(--line)' } },
      React.createElement('h1', { style: { margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)' } }, '⚙️ 設定')
    ),
    React.createElement('div', { style: { flex: 1, overflowY: 'auto', padding: '18px' } },
      React.createElement('div', { style: { marginBottom: 24 } },
        React.createElement('h3', { style: { margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: 'var(--ink)' } }, '互動方式'),
        React.createElement('div', { style: { display: 'flex', gap: 8 } }, styleBtns)
      ),
      React.createElement('div', { style: { marginBottom: 24 } },
        React.createElement('h3', { style: { margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: 'var(--ink)' } }, '主題'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          Object.entries(window.THEMES).map(([k, t]) => React.createElement('button', { key: k, onClick: () => store.setSetting('theme', k), style: { textAlign: 'left', padding: '12px 14px', borderRadius: 12, border: '1.5px solid ' + (store.state.settings.theme === k ? 'var(--accent)' : 'var(--line)'), background: store.state.settings.theme === k ? 'var(--accent-soft)' : 'var(--surface)', color: 'var(--ink)', fontSize: 13, fontWeight: 700, cursor: 'pointer' } }, t.name))
        )
      ),
      React.createElement('div', { style: { marginBottom: 24 } },
        React.createElement('h3', { style: { margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: 'var(--ink)' } }, '餐廳資料'),
        React.createElement('button', { onClick: () => setImportOpen(true), style: { width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '14px', borderRadius: 12, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', cursor: 'pointer' } },
          React.createElement('span', { style: { fontSize: 24 } }, '🗺️'),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', { style: { fontSize: 14, fontWeight: 700 } }, '匯入 Google Maps 餐廳'),
            React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 } }, '目前 ' + store.state.restaurants.length + ' 家 · 再次匯入會比對差異')
          ),
          React.createElement('span', { style: { color: 'var(--ink-faint)', fontSize: 18 } }, '›')
        )
      ),
      React.createElement('div', { style: { marginBottom: 24 } },
        React.createElement('h3', { style: { margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: 'var(--ink)' } }, '使用說明'),
        React.createElement('button', { onClick: () => setOnboardingOpen(true), style: { width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '14px', borderRadius: 12, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', cursor: 'pointer' } },
          React.createElement('span', { style: { fontSize: 24 } }, '❔'),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', { style: { fontSize: 14, fontWeight: 700 } }, '重看第一次使用說明'),
            React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 } }, '快速導覽、分頁流程與 Google Maps 匯出步驟')
          ),
          React.createElement('span', { style: { color: 'var(--ink-faint)', fontSize: 18 } }, '›')
        )
      ),
      React.createElement('div', { style: { padding: 12, background: 'var(--surface)', borderRadius: 12, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.6 } },
        React.createElement('p', { style: { margin: 0, fontWeight: 700, marginBottom: 6 } }, '💡 關於應用'),
        React.createElement('p', { style: { margin: 0 } }, '今晚吃命 v1.0 · 幫你決定今天吃什麼')
      )
    )
  );

  const btn = (key, label, icon) => React.createElement('button', { onClick: () => setTab(key), style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: key === 'dice' ? 3 : 4, padding: key === 'dice' ? 0 : '4px 0', background: 'none', border: 'none', cursor: 'pointer', position: key === 'dice' ? 'relative' : 'static', top: key === 'dice' ? -14 : 0, color: tab === key ? 'var(--accent)' : 'var(--ink-faint)' } },
    key === 'dice' ? React.createElement('span', { style: { width: 52, height: 52, borderRadius: 999, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)', border: '3px solid var(--surface)', transform: tab === key ? 'scale(1.05)' : 'scale(1)', transition: 'transform .2s', fontSize: 24 } }, getDiceIcon()) : icon,
    React.createElement('span', { style: { fontSize: 10.5, fontWeight: tab === key ? 800 : 600 } }, label)
  );

  return React.createElement('div', { ref: screenRef, style: { width: '100%', height: '100%', background: 'var(--bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' } },
    React.createElement('div', { style: { flex: 1, overflow: 'hidden' } }, mainScreen),
    React.createElement('div', { style: { flexShrink: 0, display: 'flex', padding: '8px 8px 0', background: 'var(--surface)', borderTop: '1px solid var(--line)' } },
      btn('explore', '探索', React.createElement(window.Icons.compass, { size: 23 })),
      btn('dice', '骰子', null),
      btn('diary', '紀錄', React.createElement(window.Icons.book, { size: 23 })),
      btn('stats', '統計', React.createElement(window.Icons.chart, { size: 23 })),
      btn('settings', '設定', React.createElement(window.Icons.gear, { size: 23 }))
    ),
    React.createElement(Sheet, { open: !!detail, onClose: () => setDetail(null) }, detail && React.createElement('div', { style: { padding: '4px 20px 26px' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 } },
        React.createElement('span', { style: { fontSize: 48 } }, window.cuisineOf(detail.cuisine).emoji),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('h2', { style: { margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: 'var(--ink)' } }, detail.name),
          React.createElement('p', { style: { margin: 0, fontSize: 13, color: 'var(--ink-soft)' } }, window.cuisineOf(detail.cuisine).label + ' · ' + '$'.repeat(detail.price))
        )
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 } },
        React.createElement('div', { style: { background: 'var(--surface)', borderRadius: 12, padding: 12, textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: 'var(--accent)' } }, detail.eatCount || 0),
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', marginTop: 4 } }, '吃過次數')
        ),
        React.createElement('div', { style: { background: 'var(--surface)', borderRadius: 12, padding: 12, textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: 'var(--gold)' } }, detail.rating.toFixed(1)),
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', marginTop: 4 } }, '評分')
        )
      ),
      detail.blurb && React.createElement('div', { style: { background: 'var(--surface)', borderRadius: 12, padding: 12, marginBottom: 16 } },
        React.createElement('p', { style: { margin: 0, fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 } }, detail.blurb)
      ),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 14px', borderRadius: 12, marginBottom: 16, background: detail.cuisine === 'unknown' ? 'var(--accent-soft)' : 'var(--surface)', border: '1px solid ' + (detail.cuisine === 'unknown' ? 'var(--accent)' : 'var(--line)') } },
        React.createElement('div', null,
          React.createElement('div', { style: { fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' } }, detail.cuisine === 'unknown' ? '❔ 待分類' : '料理分類'),
          React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 } }, detail.cuisine === 'unknown' ? '無法自動判斷，選一個吧' : '可手動調整')
        ),
        React.createElement(window.CuisinePicker, { value: detail.cuisine, onChange: (v) => { store.setCuisine(detail.id, v); setDetail((d) => Object.assign({}, d, { cuisine: v })); } })
      ),
      React.createElement('button', { onClick: () => window.openMaps(detail), style: { width: '100%', padding: '13px', borderRadius: 14, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--accent)', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 } }, React.createElement(window.Icons.nav, { size: 16 }), ' 在 Google Maps 開啟'),
      React.createElement('div', { style: { display: 'flex', gap: 10 } },
        React.createElement('button', { onClick: () => setDetail(null), style: { flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 15, fontWeight: 700, cursor: 'pointer' } }, '關閉'),
        React.createElement('button', { onClick: () => { setDetail(null); setLogPreset(detail); setLogOpen(true); }, style: { flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 15, fontWeight: 800, cursor: 'pointer' } }, '記錄用餐')
      )
    )),
    React.createElement(Sheet, { open: logOpen, onClose: () => setLogOpen(false), title: '記錄這一餐', full: true }, React.createElement(window.LogSheet, { store, preset: logPreset, onClose: () => { setLogOpen(false); showToast('已記錄 ✅'); } })),
    React.createElement(Sheet, { open: groupOpen, onClose: () => setGroupOpen(false), title: '和朋友一起骰', full: true }, React.createElement(window.Group, { store, onClose: () => setGroupOpen(false), onPick: pickToEat })),
    React.createElement(Sheet, { open: importOpen, onClose: () => setImportOpen(false), title: '匯入餐廳資料', full: true }, React.createElement(window.ImportSheet, { store, onClose: () => { setImportOpen(false); showToast('餐廳清單已更新 ✅'); } })),
    React.createElement(Sheet, { open: guideStep === 'import', onClose: closeImportPrompt, title: '換成你的餐廳', full: true }, React.createElement(ImportPromptSheet, { onImport: importFromOnboarding, onClose: closeImportPrompt })),
    React.createElement(Sheet, { open: needsOnboarding || onboardingOpen, onClose: closeOnboarding, title: '第一次使用說明', full: true }, React.createElement(OnboardingSheet, { onStart: startGuidedTry, onImport: importFromOnboarding, onClose: closeOnboarding })),
    React.createElement(Sheet, { open: !!editEntry, onClose: () => setEditEntry(null), title: '編輯這一餐', full: true }, editEntry && React.createElement(window.DiaryEditSheet, { store, entry: editEntry, onClose: () => setEditEntry(null) })),
    toast && React.createElement('div', { style: { position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', background: 'var(--chrome)', color: 'var(--bg)', padding: '11px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', zIndex: 80, boxShadow: '0 8px 24px rgba(0,0,0,.3)' } }, toast)
  );
};
