/* 手動新增餐廳：只必填店名，其餘欄位可之後再補。 */
const { useState: useManualState } = React;

function parseMapsUrl(url) {
  const out = { name: '', lat: null, lng: null };
  const raw = (url || '').trim();
  if (!raw) return out;
  try {
    const decoded = decodeURIComponent(raw);
    const place = decoded.match(/\/place\/([^/@?]+)/);
    if (place && place[1]) out.name = place[1].replace(/\+/g, ' ').trim();
    const at = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (at) {
      out.lat = Number(at[1]);
      out.lng = Number(at[2]);
    }
    const ll = decoded.match(/[?&](?:ll|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (ll) {
      out.lat = Number(ll[1]);
      out.lng = Number(ll[2]);
    }
  } catch (e) {}
  return out;
}

function ManualPlaceSheet({ store, onClose }) {
  const [name, setName] = useManualState('');
  const [mapUrl, setMapUrl] = useManualState('');
  const [addr, setAddr] = useManualState('');
  const [city, setCity] = useManualState('');
  const [cuisine, setCuisine] = useManualState('unknown');
  const [lat, setLat] = useManualState('');
  const [lng, setLng] = useManualState('');
  const [err, setErr] = useManualState('');

  const fillFromUrl = function (value) {
    setMapUrl(value);
    const parsed = parseMapsUrl(value);
    if (parsed.name && !name.trim()) setName(parsed.name);
    if (typeof parsed.lat === 'number' && Number.isFinite(parsed.lat)) setLat(String(parsed.lat));
    if (typeof parsed.lng === 'number' && Number.isFinite(parsed.lng)) setLng(String(parsed.lng));
  };

  const save = function () {
    const cleanName = name.trim();
    if (!cleanName) {
      setErr('先填店名就可以新增。');
      return;
    }
    const latNum = lat.trim() ? Number(lat) : 0;
    const lngNum = lng.trim() ? Number(lng) : 0;
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      setErr('座標格式不正確，可以先留空。');
      return;
    }
    const ok = store.addManualRestaurant({
      name: cleanName,
      cuisine,
      city: city.trim() || window.GMImport.cityFromAddr(addr) || '其他',
      addr: addr.trim(),
      lat: latNum,
      lng: lngNum,
      mapUrl: mapUrl.trim(),
    });
    if (!ok) {
      setErr('新增失敗，請確認店名與欄位格式。');
      return;
    }
    onClose();
  };

  const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 13px', borderRadius: 12, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, outline: 'none' };
  const labelStyle = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 850, color: 'var(--ink)' };

  return React.createElement('div', { style: { padding: '4px 18px 22px', display: 'flex', flexDirection: 'column', gap: 13 } },
    React.createElement('div', { style: { padding: '13px 14px', borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--ink-soft)', fontSize: 12.5, lineHeight: 1.65 } },
      '只要填店名就能新增；Google Maps 連結、地址、座標和分類都可以之後再補。手動新增的餐廳不會在下次匯入 Google Maps 清單時被自動刪除。'
    ),
    React.createElement('label', { style: labelStyle },
      'Google Maps 連結（選填）',
      React.createElement('input', { value: mapUrl, onChange: function (e) { fillFromUrl(e.target.value); }, placeholder: '貼上分享連結，可保留原始 Maps 連結', style: fieldStyle })
    ),
    React.createElement('label', { style: labelStyle },
      '店名',
      React.createElement('input', { value: name, onChange: function (e) { setName(e.target.value); }, placeholder: '例如：巷口牛肉麵', style: fieldStyle, autoFocus: true })
    ),
    React.createElement('label', { style: labelStyle },
      '地址或常用地點備註（選填）',
      React.createElement('input', { value: addr, onChange: function (e) { setAddr(e.target.value); }, placeholder: '例如：公司附近、台北市...', style: fieldStyle })
    ),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
      React.createElement('label', { style: labelStyle },
        '城市（選填）',
        React.createElement('input', { value: city, onChange: function (e) { setCity(e.target.value); }, placeholder: '自動或手填', style: fieldStyle })
      ),
      React.createElement('label', { style: labelStyle },
        '分類',
        React.createElement(window.CuisinePicker, { value: cuisine, onChange: setCuisine })
      )
    ),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
      React.createElement('label', { style: labelStyle },
        '緯度（選填）',
        React.createElement('input', { value: lat, onChange: function (e) { setLat(e.target.value); }, inputMode: 'decimal', placeholder: '25.04', style: fieldStyle })
      ),
      React.createElement('label', { style: labelStyle },
        '經度（選填）',
        React.createElement('input', { value: lng, onChange: function (e) { setLng(e.target.value); }, inputMode: 'decimal', placeholder: '121.56', style: fieldStyle })
      )
    ),
    err && React.createElement('div', { style: { fontSize: 12.5, color: '#d9534f', fontWeight: 750 } }, err),
    React.createElement('div', { style: { display: 'flex', gap: 10, paddingTop: 4 } },
      React.createElement('button', { onClick: onClose, style: { flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14.5, fontWeight: 800, cursor: 'pointer' } }, '取消'),
      React.createElement('button', { onClick: save, style: { flex: 1.4, padding: '14px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 14.5, fontWeight: 900, cursor: 'pointer' } }, '新增餐廳')
    )
  );
}

window.ManualPlaceSheet = ManualPlaceSheet;
