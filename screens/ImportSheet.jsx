/* Google Maps 餐廳匯入 + 差異比對（新增 / 刪除，使用者勾選確認）
   分類／解析全部走 import-util.js 的 window.GMImport（純程式，無 AI），
   與產生種子資料 data.js 的是同一段程式。 */
const { useState, useMemo } = React;
const ZIP_LOCAL_FILE = 0x04034b50;
const ZIP_CENTRAL_FILE = 0x02014b50;
const ZIP_END = 0x06054b50;

// 假測試資料：保留現有大部分，故意少掉最後 2 家（示範刪除），再加 A／B／C（C 示範待分類）
function fakeImport(current) {
  const kept = current.slice(0, Math.max(0, current.length - 2));
  return kept.concat([
    { id: 'gmA', name: 'A 餐廳（測試）', cuisine: 'noodle', confidence: 'food', price: 2, rating: 4, lat: 25.05, lng: 121.52, city: '台北', addr: '台北市測試路 A 號', eatCount: 0, lastEaten: '', dineIn: true, tags: ['測試'], blurb: '匯入測試用的 A 餐廳。' },
    { id: 'gmB', name: 'B 餐廳（測試）', cuisine: 'snack', confidence: 'food', price: 1, rating: 5, lat: 24.99, lng: 121.30, city: '桃園', addr: '桃園市測試路 B 號', eatCount: 0, lastEaten: '', dineIn: true, tags: ['測試'], blurb: '匯入測試用的 B 餐廳。' },
    { id: 'gmC', name: 'C 神祕小店（測試）', cuisine: 'unknown', confidence: 'maybe', price: 1, rating: 4, lat: 25.10, lng: 121.55, city: '台北', addr: '台北市測試路 C 號', eatCount: 0, lastEaten: '', dineIn: true, tags: ['測試'], blurb: '沒有食物訊號，不確定是不是餐廳。' },
    { id: 'gmD', name: 'D 公園（測試）', cuisine: 'unknown', confidence: 'skip', price: 1, rating: 0, lat: 25.11, lng: 121.56, city: '台北', addr: '台北市測試路 D 號', eatCount: 0, lastEaten: '', dineIn: true, tags: ['測試'], blurb: '', importReason: '像景點或設施，且沒有餐飲訊號' },
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

function readArrayBufferFile(file) {
  if (file.arrayBuffer) return file.arrayBuffer();
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function decodeZipName(bytes, flags) {
  const encoding = (flags & 0x0800) ? 'utf-8' : 'utf-8';
  return new TextDecoder(encoding).decode(bytes);
}

function findZipEnd(view) {
  const min = Math.max(0, view.byteLength - 65557);
  for (var i = view.byteLength - 22; i >= min; i--) {
    if (view.getUint32(i, true) === ZIP_END) return i;
  }
  return -1;
}

function inflateRaw(bytes) {
  if (typeof DecompressionStream === 'undefined') {
    return Promise.reject(new Error('zip deflate is not supported'));
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).arrayBuffer();
}

function readZipJsonFiles(file) {
  return readArrayBufferFile(file).then(function (buffer) {
    const view = new DataView(buffer);
    const end = findZipEnd(view);
    if (end < 0) throw new Error('zip end not found');
    const total = view.getUint16(end + 10, true);
    var ptr = view.getUint32(end + 16, true);
    const reads = [];
    for (var i = 0; i < total; i++) {
      if (view.getUint32(ptr, true) !== ZIP_CENTRAL_FILE) throw new Error('zip central directory is invalid');
      const flags = view.getUint16(ptr + 8, true);
      const method = view.getUint16(ptr + 10, true);
      const compressedSize = view.getUint32(ptr + 20, true);
      const nameLen = view.getUint16(ptr + 28, true);
      const extraLen = view.getUint16(ptr + 30, true);
      const commentLen = view.getUint16(ptr + 32, true);
      const localOffset = view.getUint32(ptr + 42, true);
      const name = decodeZipName(new Uint8Array(buffer, ptr + 46, nameLen), flags);
      ptr += 46 + nameLen + extraLen + commentLen;
      if (!/\.json$/i.test(name)) continue;
      if (view.getUint32(localOffset, true) !== ZIP_LOCAL_FILE) throw new Error('zip local file is invalid');
      const localNameLen = view.getUint16(localOffset + 26, true);
      const localExtraLen = view.getUint16(localOffset + 28, true);
      const dataOffset = localOffset + 30 + localNameLen + localExtraLen;
      const compressed = new Uint8Array(buffer, dataOffset, compressedSize);
      const payload = method === 0
        ? Promise.resolve(compressed.slice().buffer)
        : method === 8
          ? inflateRaw(compressed)
          : Promise.reject(new Error('zip compression method is not supported'));
      reads.push(payload.then(function (raw) {
        return JSON.parse(new TextDecoder('utf-8').decode(raw));
      }));
    }
    if (!reads.length) throw new Error('zip has no json');
    return Promise.all(reads);
  });
}

function Row({ r, checked, onToggle, danger, cuisine, onCuisine, muted }) {
  const cz = window.cuisineOf(cuisine || r.cuisine);
  const isUnknown = (cuisine || r.cuisine) === 'unknown';
  return React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: isUnknown ? 'var(--accent-soft)' : 'var(--surface)', border: '1px solid ' + (isUnknown ? 'var(--accent)' : 'var(--line)'), opacity: muted && !checked ? 0.82 : 1, cursor: 'pointer' } },
    React.createElement('input', { type: 'checkbox', checked: checked, onChange: onToggle, style: { width: 18, height: 18, accentColor: danger ? '#d9534f' : 'var(--accent)', flexShrink: 0 } }),
    React.createElement('span', { style: { fontSize: 22, flexShrink: 0 } }, cz.emoji),
    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
      React.createElement('div', { style: { fontSize: 14.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, r.name),
      React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink-soft)' } }, (r.city || '其他') + ' · ' + cz.label + (r.rating ? ' · ★' + r.rating : '') + (r.mapUrl ? ' · Google Maps' : '')),
      r.importReason && React.createElement('div', { style: { fontSize: 11.5, color: muted ? '#a65f2b' : 'var(--ink-soft)', marginTop: 2 } }, r.importReason)
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
  const [showSkipped, setShowSkipped] = useState(false);
  const [showImportHelp, setShowImportHelp] = useState(false);

  const startReview = function (list) {
    const d = diffImport(current, list);
    const a = {}; d.add.forEach(function (r) { a[r.id] = r.confidence === 'food'; }); // 不確定與排除項預設不勾
    const rm = {}; d.remove.forEach(function (r) { rm[r.id] = true; });
    const cm = {}; d.add.forEach(function (r) { cm[r.id] = r.cuisine; });
    setImported(list); setAddSel(a); setRmSel(rm); setCuisineMap(cm); setErr(''); setStage('review');
  };

  const readJsonFile = function (file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        try {
          resolve(JSON.parse(reader.result));
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const readInputFile = function (file) {
    if (/\.zip$/i.test(file.name || '') || /zip/i.test(file.type || '')) return readZipJsonFiles(file);
    return readJsonFile(file).then(function (json) { return [json]; });
  };

  const onFile = function (e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    Promise.all(files.map(readInputFile)).then(function (nestedJsonList) {
      try {
        const jsonList = [].concat.apply([], nestedJsonList);
        const parsedLists = jsonList.map(function (json) { return window.GMImport.parseGeoJSON(json, { includeNonFood: true }); });
        const list = window.GMImport.mergeRestaurantLists(parsedLists);
        if (!list.length) { setErr('檔案裡找不到可匯入的地點（需 Google Maps「地圖（你的地點）」匯出的 GeoJSON）。'); return; }
        startReview(list);
      } catch (e2) { setErr('檔案解析失敗，請確認是 Google Maps「地圖（你的地點）」匯出的 .zip 或 .json。'); }
    }).catch(function () {
      setErr('檔案解析失敗，請確認檔案是 Google Maps「地圖（你的地點）」匯出的 .zip，或解壓縮後的 .json。');
    });
  };

  const apply = function () {
    const addList = diff.add.filter(function (r) { return addSel[r.id]; })
      .map(function (r) { return Object.assign({}, r, { cuisine: cuisineMap[r.id] || r.cuisine, confidence: 'food' }); });
    const removeIds = diff.remove.filter(function (r) { return rmSel[r.id]; }).map(function (r) { return r.id; });
    store.applyImport(addList, removeIds);
    onClose();
  };

  if (stage === 'pick') {
    return React.createElement('div', { style: { padding: '4px 4px 20px', display: 'flex', flexDirection: 'column', gap: 14 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--line)' } },
        React.createElement('div', { style: { flex: 1, minWidth: 0 } },
          React.createElement('div', { style: { fontSize: 13.5, fontWeight: 850, color: 'var(--ink)', marginBottom: 4 } }, '匯出方式'),
          React.createElement('p', { style: { margin: 0, fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.6 } },
            '到 ',
            React.createElement('a', { href: 'https://takeout.google.com', target: '_blank', rel: 'noopener noreferrer', onClick: function (e) { e.stopPropagation(); }, style: { color: 'var(--accent)', fontWeight: 900, textDecoration: 'underline' } }, 'takeout.google.com'),
            ' → 取消全選 → 只勾「地圖（你的地點）」這一項，不需要勾上方的「地圖」→ 下一步 → 建立匯出。下載後可直接選 .zip，也可以解壓縮後選「評論.json」與「已儲存的地點.json」。'
          )
        ),
        React.createElement('button', { onClick: function () { setShowImportHelp(true); }, 'aria-label': '查看安全說明', style: { width: 32, height: 32, borderRadius: 999, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--accent)', fontSize: 18, fontWeight: 900, cursor: 'pointer', flexShrink: 0 } }, '!')
      ),
      showImportHelp && React.createElement(React.Fragment, null,
        React.createElement('button', { onMouseDown: function () { setShowImportHelp(false); }, onClick: function () { setShowImportHelp(false); }, 'aria-label': '關閉安全說明背景', style: { position: 'fixed', inset: 0, zIndex: 80, border: 'none', background: 'rgba(24, 19, 15, 0.34)', padding: 0, cursor: 'default' } }),
        React.createElement('div', { role: 'dialog', 'aria-modal': 'true', 'aria-label': '安全說明', onClick: function (event) { event.stopPropagation(); }, style: { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 81, width: 'min(360px, calc(100vw - 40px))', borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: '0 18px 45px rgba(24, 19, 15, 0.24)', padding: '18px 18px 16px' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 } },
            React.createElement('div', { style: { fontSize: 16, fontWeight: 900, color: 'var(--ink)' } }, '安全說明'),
            React.createElement('button', { onClick: function () { setShowImportHelp(false); }, 'aria-label': '關閉安全說明', style: { width: 30, height: 30, borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink-soft)', fontSize: 18, fontWeight: 800, cursor: 'pointer' } }, '×')
          ),
          React.createElement('p', { style: { margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7 } }, 'Google 地圖資料匯出只會包含你記錄的店名、餐廳地址、座標、日期、評論文字與 Maps 連結；不需要匯入其他 Google 資料，也就能避免不必要的個人敏感資料疑慮。本 App 只在你的瀏覽器中解析這些欄位，用來整理餐廳候選。')
        )
      ),
      React.createElement('label', { style: { display: 'block', padding: '16px', borderRadius: 14, border: '2px dashed var(--line)', background: 'var(--surface)', textAlign: 'center', cursor: 'pointer' } },
        React.createElement('div', { style: { fontSize: 30, marginBottom: 6 } }, '📁'),
        React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--ink)' } }, '選擇 Google Maps .zip 或 .json 檔'),
        React.createElement('div', { style: { fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 4 } }, '可直接選 Takeout 壓縮檔，或解壓縮後多選「評論.json」與「已儲存的地點.json」'),
        React.createElement('input', { type: 'file', accept: '.zip,application/zip,application/x-zip-compressed,.json,application/json', multiple: true, onChange: onFile, style: { display: 'none' } })
      ),
      React.createElement('button', { onClick: function () { startReview(fakeImport(current)); }, style: { padding: '13px', borderRadius: 12, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontWeight: 700, cursor: 'pointer' } }, '🧪 用測試資料模擬匯入（A／B 餐廳）'),
      err && React.createElement('div', { style: { fontSize: 12.5, color: '#d9534f', fontWeight: 600 } }, err)
    );
  }

  const foods = diff.add.filter(function (r) { return r.confidence === 'food'; });
  const maybes = diff.add.filter(function (r) { return r.confidence === 'maybe'; });
  const skipped = diff.add.filter(function (r) { return r.confidence === 'skip'; });
  const visibleSkipped = showSkipped ? skipped : skipped.slice(0, 5);
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
    skipped.length > 0 && React.createElement('div', null,
      React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--line)', marginBottom: 8 } },
        React.createElement('span', { style: { fontSize: 22, flexShrink: 0 } }, '🚫'),
        React.createElement('div', { style: { fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.6 } },
          React.createElement('b', null, '有 ' + skipped.length + ' 筆被判定不是餐廳'),
          '。這些會預設不匯入；若分類錯了，勾選後會以餐廳加入。'
        )
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        visibleSkipped.map(function (r) {
          return React.createElement(Row, { key: r.id, r: r, checked: !!addSel[r.id], muted: true, cuisine: cuisineMap[r.id] || r.cuisine, onCuisine: function (v) { setCuisineMap(function (s) { const n = Object.assign({}, s); n[r.id] = v; return n; }); }, onToggle: function () { setAddSel(function (s) { const n = Object.assign({}, s); n[r.id] = !n[r.id]; return n; }); } });
        })
      ),
      skipped.length > 5 && React.createElement('button', { onClick: function () { setShowSkipped(function (v) { return !v; }); }, style: { width: '100%', marginTop: 8, padding: '11px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, fontWeight: 800, cursor: 'pointer' } }, showSkipped ? '收合非餐廳清單' : '展開全部 ' + skipped.length + ' 筆')
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
