/* Google Maps 餐廳匯入 + 差異比對（新增 / 刪除，使用者勾選確認）
   分類／解析全部走 import-util.js 的 window.GMImport（純程式，無 AI），
   與產生種子資料 data.js 的是同一段程式。 */
const { useState, useMemo } = React;

// 假測試資料：保留現有大部分，故意少掉最後 2 家（示範刪除），再加 A／B／C（C 示範待分類）
function fakeImport(current) {
  const kept = current.slice(0, Math.max(0, current.length - 2));
  return kept.concat([
    { id: 'gmA', name: 'A 餐廳（測試）', cuisine: 'noodle', confidence: 'food', price: 2, rating: 4, lat: 25.05, lng: 121.52, city: '台北', addr: '台北市測試路 A 號', eatCount: 0, lastEaten: '', dineIn: true, tags: ['測試'], blurb: '匯入測試用的 A 餐廳。' },
    { id: 'gmB', name: 'B 餐廳（測試）', cuisine: 'snack', confidence: 'food', price: 1, rating: 5, lat: 24.99, lng: 121.30, city: '桃園', addr: '桃園市測試路 B 號', eatCount: 0, lastEaten: '', dineIn: true, tags: ['測試'], blurb: '匯入測試用的 B 餐廳。' },
    { id: 'gmC', name: 'C 神祕小店（測試）', cuisine: 'unknown', confidence: 'maybe', price: 1, rating: 4, lat: 25.10, lng: 121.55, city: '台北', addr: '台北市測試路 C 號', eatCount: 0, lastEaten: '', dineIn: true, tags: ['測試'], blurb: '沒有食物訊號，不確定是不是餐廳。' },
  ]);
}

function diffImport(current, imported) {
  const curById = {};
  current.forEach(function (r) { curById[r.id] = r; });
  const impById = {};
  imported.forEach(function (r) { impById[r.id] = r; });
  const add = imported.filter(function (r) { return !curById[r.id]; });
  const remove = current.filter(function (r) { return !impById[r.id]; });
  return { add: add, remove: remove };
}

function Row({ r, checked, onToggle, danger, cuisine, onCuisine }) {
  const cz = window.cuisineOf(cuisine || r.cuisine);
  const isUnknown = (cuisine || r.cuisine) === 'unknown';
  return React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: isUnknown ? 'var(--accent-soft)' : 'var(--surface)', border: '1px solid ' + (isUnknown ? 'var(--accent)' : 'var(--line)'), cursor: 'pointer' } },
    React.createElement('input', { type: 'checkbox', checked: checked, onChange: onToggle, style: { width: 18, height: 18, accentColor: danger ? '#d9534f' : 'var(--accent)', flexShrink: 0 } }),
    React.createElement('span', { style: { fontSize: 22, flexShrink: 0 } }, cz.emoji),
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement('div', { style: { fontSize: 14.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, r.name),
      React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink-soft)' } }, (r.city || '其他') + ' · ' + cz.label + (r.rating ? ' · ★' + r.rating : ''))
    ),
    onCuisine && React.createElement(window.CuisinePicker, { value: cuisine || r.cuisine, compact: true, onChange: onCuisine })
  );
}

function ImportSheet({ store, onClose }) {
  const [stage, setStage] = useState('pick'); // pick | review
  const [imported, setImported] = useState(null);
  const [err, setErr] = useState('');
  const current = store.state.restaurants;

  const diff = useMemo(function () {
    return imported ? diffImport(current, imported) : { add: [], remove: [] };
  }, [imported, current]);

  const [addSel, setAddSel] = useState({});
  const [rmSel, setRmSel] = useState({});
  const [cuisineMap, setCuisineMap] = useState({}); // id → 使用者選的分類

  const startReview = function (list) {
    const d = diffImport(current, list);
    const a = {}; d.add.forEach(function (r) { a[r.id] = r.confidence !== 'maybe'; }); // 不確定的預設不勾
    const rm = {}; d.remove.forEach(function (r) { rm[r.id] = true; });
    const cm = {}; d.add.forEach(function (r) { cm[r.id] = r.cuisine; });
    setImported(list); setAddSel(a); setRmSel(rm); setCuisineMap(cm); setErr(''); setStage('review');
  };

  const onFile = function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const json = JSON.parse(reader.result);
        const list = window.GMImport.parseGeoJSON(json);
        if (!list.length) { setErr('檔案裡找不到可匯入的地點（需 Google Maps 匯出的 GeoJSON）。'); return; }
        startReview(list);
      } catch (e2) { setErr('檔案解析失敗，請確認是 Google Maps 匯出的 .json。'); }
    };
    reader.readAsText(file);
  };

  const apply = function () {
    const addList = diff.add.filter(function (r) { return addSel[r.id]; })
      .map(function (r) { return Object.assign({}, r, { cuisine: cuisineMap[r.id] || r.cuisine }); });
    const removeIds = diff.remove.filter(function (r) { return rmSel[r.id]; }).map(function (r) { return r.id; });
    store.applyImport(addList, removeIds);
    onClose();
  };

  if (stage === 'pick') {
    return React.createElement('div', { style: { padding: '4px 4px 20px', display: 'flex', flexDirection: 'column', gap: 14 } },
      React.createElement('p', { style: { margin: 0, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 } }, '從 Google Maps 匯出「已儲存的地點」或「評論」的 .json 檔來更新清單。系統會自動分流：是餐廳的收錄、明顯是景點/設施的排除、不確定的列出來讓你勾選。再次匯入會比對差異，由你確認新增或刪除。'),
      React.createElement('label', { style: { display: 'block', padding: '16px', borderRadius: 14, border: '2px dashed var(--line)', background: 'var(--surface)', textAlign: 'center', cursor: 'pointer' } },
        React.createElement('div', { style: { fontSize: 30, marginBottom: 6 } }, '📁'),
        React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--ink)' } }, '選擇 Google Maps .json 檔'),
        React.createElement('input', { type: 'file', accept: '.json,application/json', onChange: onFile, style: { display: 'none' } })
      ),
      React.createElement('button', { onClick: function () { startReview(fakeImport(current)); }, style: { padding: '13px', borderRadius: 12, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontWeight: 700, cursor: 'pointer' } }, '🧪 用測試資料模擬匯入（A／B 餐廳）'),
      err && React.createElement('div', { style: { fontSize: 12.5, color: '#d9534f', fontWeight: 600 } }, err)
    );
  }

  const foods = diff.add.filter(function (r) { return r.confidence !== 'maybe'; });
  const maybes = diff.add.filter(function (r) { return r.confidence === 'maybe'; });
  const nAdd = diff.add.filter(function (r) { return addSel[r.id]; }).length;
  const nRm = diff.remove.filter(function (r) { return rmSel[r.id]; }).length;
  const nUnknown = diff.add.filter(function (r) { return addSel[r.id] && (cuisineMap[r.id] || r.cuisine) === 'unknown'; }).length;

  const addRow = function (r) {
    return React.createElement(Row, { key: r.id, r: r, checked: !!addSel[r.id], cuisine: cuisineMap[r.id] || r.cuisine, onCuisine: function (v) { setCuisineMap(function (s) { const n = Object.assign({}, s); n[r.id] = v; return n; }); }, onToggle: function () { setAddSel(function (s) { const n = Object.assign({}, s); n[r.id] = !n[r.id]; return n; }); } });
  };

  return React.createElement('div', { style: { padding: '4px 4px 16px', display: 'flex', flexDirection: 'column', gap: 14 } },
    (diff.add.length === 0 && diff.remove.length === 0)
      ? React.createElement('div', { style: { textAlign: 'center', padding: '30px 10px', color: 'var(--ink-soft)' } }, React.createElement('div', { style: { fontSize: 38, marginBottom: 8 } }, '✅'), '沒有差異，清單已是最新。')
      : null,
    foods.length > 0 && React.createElement('div', null,
      React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 } }, '➕ 餐廳 ', foods.length, ' 家'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } }, foods.map(addRow))
    ),
    maybes.length > 0 && React.createElement('div', null,
      React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12, background: 'var(--accent-soft)', border: '1.5px solid var(--accent)', marginBottom: 8 } },
        React.createElement('span', { style: { fontSize: 22, flexShrink: 0 } }, '❔'),
        React.createElement('div', { style: { fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.6 } },
          React.createElement('b', null, '有 ' + maybes.length + ' 筆無法確定是不是餐廳'),
          '（沒有消費資訊、也沒有料理關鍵字，可能是景點或店家）。預設不加入，請勾選真的是餐廳的。'
        )
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } }, maybes.map(addRow))
    ),
    nUnknown > 0 && React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)' } },
      React.createElement('span', { style: { fontSize: 20, flexShrink: 0 } }, '🏷️'),
      React.createElement('div', { style: { fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.6 } },
        '其中 ', React.createElement('b', { style: { color: 'var(--ink)' } }, nUnknown + ' 筆未分類'), '，可在上方右側選類別，或事後到餐廳詳情再改。'
      )
    ),
    diff.remove.length > 0 && React.createElement('div', null,
      React.createElement('div', { style: { fontSize: 13, fontWeight: 800, color: '#d9534f', marginBottom: 8 } }, '➖ 刪除 ', diff.remove.length, ' 家（已不在檔案中）'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        diff.remove.map(function (r) { return React.createElement(Row, { key: r.id, r: r, danger: true, checked: !!rmSel[r.id], onToggle: function () { setRmSel(function (s) { const n = Object.assign({}, s); n[r.id] = !n[r.id]; return n; }); } }); })
      )
    ),
    React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 4 } },
      React.createElement('button', { onClick: function () { setStage('pick'); }, style: { flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' } }, '返回'),
      React.createElement('button', { onClick: apply, style: { flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 14.5, fontWeight: 800, cursor: 'pointer' } }, '套用（+' + nAdd + ' / −' + nRm + '）')
    )
  );
}

window.ImportSheet = ImportSheet;
