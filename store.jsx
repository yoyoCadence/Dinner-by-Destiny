/* useStore — App 全域狀態，存到 localStorage */
const { useState, useEffect, useCallback, useRef, useMemo } = React;

const STORE_KEY = 'dinner_by_destiny_v1';

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) {}
  return null;
}

// 把靜態欄位（座標、店名、料理…）用最新種子覆寫，保留使用者資料（吃過次數、評分、日記、跳過）
function migrate(s) {
  if (!s || !s.restaurants) return s;
  // 補上後來新增的設定欄位
  s.settings = Object.assign({ theme: 'warm', radius: 1200, noRadius: true, city: 'all', layout: 'card', diceStyle: 'dice' }, s.settings || {});
  const seedById = {};
  window.SEED_RESTAURANTS.forEach((r) => { seedById[r.id] = r; });
  const savedById = {};
  s.restaurants.forEach((r) => { savedById[r.id] = r; });
  s.restaurants = window.SEED_RESTAURANTS.map((seed) => {
    const old = savedById[seed.id] || {};
    return {
      ...seed,
      eatCount: old.eatCount != null ? old.eatCount : seed.eatCount,
      lastEaten: old.lastEaten || seed.lastEaten,
      rating: old.rating != null ? old.rating : seed.rating,
      excludedUntil: old.excludedUntil || null,
    };
  });
  return s;
}

function defaultState() {
  // 把種子資料攤平成可變狀態
  const restaurants = window.SEED_RESTAURANTS.map((r) => ({ ...r, excludedUntil: null }));
  return {
    restaurants,
    diary: [], // {id, date, restId, name, cuisine, price, cost, mood, note}
    settings: {
      theme: 'warm',
      radius: 1200, // 公尺
      noRadius: true, // 不限距離：true 時忽略半徑，顯示全部餐廳
      city: 'all', // all | 台北 | 新北 | ...
      layout: 'card', // card | compact | magazine
      diceStyle: 'dice', // dice | slot | card
    },
    friends: [
      { id: 'f1', name: '小美', emoji: '🦊' },
      { id: 'f2', name: '阿傑', emoji: '🐻' },
      { id: 'f3', name: '宥宥', emoji: '🐰' },
    ],
    onboarded: true,
  };
}

function useStore() {
  const [state, setState] = useState(() => loadStore() || defaultState());

  // 持久化
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const setSetting = useCallback((k, v) => {
    setState((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));
  }, []);

  // 記錄今天吃了某家
  const logMeal = useCallback((entry) => {
    setState((s) => {
      const rec = {
        id: 'd' + Date.now(),
        date: entry.date || window.todayStr(),
        restId: entry.restId || null,
        name: entry.name,
        cuisine: entry.cuisine || null,
        price: entry.price || null,
        cost: entry.cost != null ? entry.cost : null,
        mood: entry.mood || null,
        note: entry.note || '',
      };
      const restaurants = s.restaurants.map((r) =>
        r.id === entry.restId
          ? { ...r, eatCount: (r.eatCount || 0) + 1, lastEaten: rec.date }
          : r
      );
      return { ...s, diary: [rec, ...s.diary], restaurants };
    });
  }, []);

  const deleteDiary = useCallback((id) => {
    setState((s) => {
      const rec = s.diary.find((d) => d.id === id);
      let restaurants = s.restaurants;
      if (rec && rec.restId) {
        restaurants = s.restaurants.map((r) =>
          r.id === rec.restId ? { ...r, eatCount: Math.max(0, (r.eatCount || 0) - 1) } : r
        );
      }
      return { ...s, diary: s.diary.filter((d) => d.id !== id), restaurants };
    });
  }, []);

  // 編輯一筆日記（日期、金額、心情、備註…）
  const updateDiary = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      diary: s.diary.map((d) => (d.id === id ? Object.assign({}, d, patch) : d)),
    }));
  }, []);

  // 修改餐廳分類（待分類 → 指定類別，匯入後可改）
  const setCuisine = useCallback((restId, cuisine) => {
    setState((s) => ({
      ...s,
      restaurants: s.restaurants.map((r) => (r.id === restId ? Object.assign({}, r, { cuisine }) : r)),
    }));
  }, []);

  // 最近吃膩了：排除 N 天
  const snooze = useCallback((restId, days) => {
    const until = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
    setState((s) => ({
      ...s,
      restaurants: s.restaurants.map((r) => (r.id === restId ? { ...r, excludedUntil: until } : r)),
    }));
  }, []);
  const unsnooze = useCallback((restId) => {
    setState((s) => ({
      ...s,
      restaurants: s.restaurants.map((r) => (r.id === restId ? { ...r, excludedUntil: null } : r)),
    }));
  }, []);

  const setRating = useCallback((restId, rating) => {
    setState((s) => ({
      ...s,
      restaurants: s.restaurants.map((r) => (r.id === restId ? { ...r, rating } : r)),
    }));
  }, []);

  const resetAll = useCallback(() => setState(defaultState()), []);

  // 套用 Google Maps 匯入差異：新增 addList、刪除 removeIds
  const applyImport = useCallback((addList, removeIds) => {
    setState((s) => {
      const removeSet = new Set(removeIds || []);
      const restaurants = s.restaurants.filter((r) => !removeSet.has(r.id));
      const existing = new Set(restaurants.map((r) => r.id));
      (addList || []).forEach((r) => {
        if (!existing.has(r.id)) restaurants.push(Object.assign({ excludedUntil: null }, r));
      });
      return { ...s, restaurants };
    });
  }, []);

  return {
    state, setState,
    setSetting, logMeal, deleteDiary, updateDiary, setCuisine, snooze, unsnooze, setRating, resetAll, applyImport,
  };
}

window.useStore = useStore;
window.isSnoozed = function (r) {
  return r.excludedUntil && window.daysAgo(r.excludedUntil) < 0;
};
