/* Google Maps 匯入工具 — 純程式分類，無 AI。
   App 的匯入流程與種子資料產生都共用這支，確保「看到的＝程式跑出來的」。 */
(function () {
  // 由店名關鍵字判斷料理類別（順序＝優先序）。猜不到 → 'unknown'（待分類）
  function guessCuisine(name) {
    var n = name || '';
    var rules = [
      // 麵食
      [/(粄條|板條|米干|米線|餛飩|扁食|拉麵|烏龍麵|刀削|牛肉麵|麵店|拉麵|擔仔麵|陽春麵|麻醬麵|炸醬麵|意麵|油麵|湯麵|乾麵|涼麵|麵線|鍋燒|義大利麵|手工麵|麵食|麵館|麵$)/, 'noodle'],
      // 雞鴨鵝
      [/(鴨肉|烤鴨|薑母鴨|鵝肉|雞肉飯|火雞|甕仔雞|甕缸雞|桶仔雞|燒臘|油雞|白斬雞|鹽水雞|雞家莊|土雞|放山雞)/, 'poultry'],
      // 火鍋
      [/(火鍋|羊肉爐|涮涮|涮々|麻辣鍋|海底撈|鴛鴦鍋|石頭火鍋|薑母鴨|酸菜白肉|圍爐|鍋物|湯頭|個人鍋|燒烤吃到飽)/, 'hotpot'],
      // 日式
      [/(壽司|刺身|生魚片|日本料理|日式|定食|丼飯|丼$|親子丼|牛丼|食事|割烹|燒肉|燒鳥|居酒屋|拉麵|和食|天婦羅|烏龍|鰻|蕎麥|大阪燒|章魚燒|味噌|釜飯|關東煮|屋台)/, 'japanese'],
      // 南洋／東南亞
      [/(打拋|嘎拋|泰式|泰國|南洋|越南|越式|河粉|海南雞|新加坡|馬來|叻沙|印尼|沙嗲|咖哩|綠咖哩|月亮蝦餅|椒麻雞)/, 'thai'],
      // 西式
      [/(漢堡|炸雞|薯條|牛排|沙朗|肋眼|菲力|披薩|pizza|義式|義大利|焗烤|燉飯|墨西哥|塔可|taco|brunch|bistro|餐酒|牛排館|速食|丹丹|德州|美式|歐式|法式|排餐|鐵板)/i, 'western'],
      // 早點
      [/(蛋餅|燒餅|蔥油餅|抓餅|饅頭|包子|三明治|吐司|漢堡蛋|早餐|早午餐|油條|豆漿|米漿|飯糰|蘿蔔糕|碳烤吐司|可頌|貝果)/, 'breakfast'],
      // 冰甜
      [/(冰城|芋冰|剉冰|刨冰|挫冰|冰品|冰菓|甜點|甜品|豆花|豆腐花|愛玉|仙草|燒仙草|芋圓|粉圓|蛋糕|布丁|雪花冰|冰淇淋|霜淇淋|甜甜圈|鬆餅|可麗餅|車輪餅|紅豆餅|雞蛋糕|麻糬|恬點|烘焙|甜食|下午茶)/, 'dessert'],
      // 小吃
      [/(蚵仔煎|蚵嗲|夜市|小吃|滷味|魯味|關東煮|甜不辣|黑輪|花枝羹|魷魚羹|肉羹|生炒|香腸|大腸|米血|鹹酥|鹽酥|雞排|卜肉|糕渣|馬蛋|地瓜球|車輪|肉圓|碗粿|米糕|筒仔|臭豆腐|割包|刈包|潤餅|春捲|擔仔|四神湯|貢丸|魚丸|肉粽|粽|爆漿|串燒|串炸|烤物|燒烤|鐵板燒)/, 'snack'],
      // 台式（自助餐、便當、熱炒、合菜、家常…）
      [/(便當|自助餐|快餐|熱炒|快炒|合菜|台菜|客家菜|海產|熱炒店|炒飯|燴飯|焢肉|爌肉|滷肉飯|魯肉飯|雞腿飯|排骨飯|控肉|家常|小館|食堂|餐館|餐廳|飯館|無刺|海鮮|產地|風味|料理)/, 'taiwanese'],
    ];
    for (var i = 0; i < rules.length; i++) if (rules[i][0].test(n)) return rules[i][1];
    return 'unknown';
  }

  // 強非餐廳關鍵字（即使店名含食物詞也一律排除：停車場、醫院、加油站…）
  var HARD_NON_FOOD = /(停車|醫院|診所|家畜|家禽|獸醫|動物醫院|加油|駕訓|砲台|牧場|動物園|博物館|遊憩|水域|纜車|貨櫃|電信|大哥大|門市|郵局|銀行|POP\s?MART|泡泡瑪特)/i;
  // 軟非餐廳關鍵字（沒有任何食物訊號時才排除：景點、設施…）
  var SOFT_NON_FOOD = /(樂園|飯店|大飯店|溫泉|美術|藝術中心|展覽|生態|步道|瀑布|公園|老街|車站|碼頭$|機場|水族|奇珍|教育中心|王國|夢工廠|物語|森林|鑛業|礦業|整煤|煤廠|糖廠|貓村|村$|樓$|亭$|館$|山$|嶺|洞|巖|湖|橋|池|寺|宮$|廟$)/i;
  var NON_FOOD = new RegExp(HARD_NON_FOOD.source + '|' + SOFT_NON_FOOD.source, 'i');
  function isFood(name) { return !NON_FOOD.test(name || ''); }

  // 是否有「平均每人消費」問卷 → 餐廳的強訊號（景點不會被問）
  function hasSpendQuestion(p) {
    var qs = (p && p.questions) || [];
    for (var i = 0; i < qs.length; i++) if (/平均每人消費|消費金額/.test(qs[i].question || '')) return true;
    return false;
  }

  // 三層分流：'food'（確定收錄）/ 'maybe'（不確定，交使用者勾選）/ 'skip'（排除）
  function classifyPlace(name, p) {
    var n = name || '';
    if (HARD_NON_FOOD.test(n)) return 'skip';                  // 停車/醫院… 最高優先
    if (hasSpendQuestion(p) || guessCuisine(n) !== 'unknown') return 'food'; // 強食物訊號
    if (SOFT_NON_FOOD.test(n)) return 'skip';                  // 景點且無食物訊號
    return 'maybe';                                            // 模稜兩可
  }

  // 清理店名：去掉「|說明」與結尾括號附註
  function cleanName(n) {
    n = (n || '').split(/[|｜]/)[0];
    n = n.replace(/（[^）]*）\s*$/, '').replace(/\([^)]*\)\s*$/, '');
    return n.trim();
  }

  function cityFromAddr(a) {
    var m = (a || '').match(/(台北|臺北|新北|基隆|桃園|宜蘭|台中|臺中|高雄|台南|臺南|新竹|苗栗|彰化|南投|雲林|嘉義|屏東|花蓮|台東|臺東|澎湖|金門|連江)/);
    return m ? m[1].replace('臺', '台') : '其他';
  }

  function idFromName(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return 'gm' + h.toString(36);
  }

  // 由評論的「平均每人消費金額」選項換算價位 1/2/3
  function priceFromQuestions(questions) {
    if (!questions) return 0;
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      if (q.question === '平均每人消費金額' && q.selected_option) {
        var s = q.selected_option.replace(/[$,，\s]/g, '');
        var lo = parseInt((s.match(/\d+/) || [0])[0], 10);
        if (lo >= 600) return 3;
        if (lo >= 200) return 2;
        return 1;
      }
    }
    return 0;
  }

  // 由評論文字估計吃過次數（「吃三次」「好幾次」…）
  var NUM = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
  function eatCountFromText(t) {
    if (!t) return 0;
    var m = t.match(/吃?(?:了|過)?\s*([一二三四五六七八九十\d]+)\s*次/);
    if (m) { var v = m[1]; return NUM[v] || parseInt(v, 10) || 0; }
    if (/好幾次|很多次|無數次/.test(t)) return 4;
    return 0;
  }

  // 解析一個 Google Maps GeoJSON（FeatureCollection）→ 餐廳陣列（純程式分類）
  function parseGeoJSON(json, opts) {
    opts = opts || {};
    var feats = (json && json.features) || [];
    var seen = {};
    var out = [];
    for (var i = 0; i < feats.length; i++) {
      var f = feats[i];
      var p = f.properties || {};
      var loc = p.location || {};
      var name = loc.name;
      var coords = (f.geometry && f.geometry.coordinates) || [0, 0];
      if (!name) continue;
      if (coords[0] === 0 && coords[1] === 0) continue;
      var conf = classifyPlace(name, p);
      if (conf === 'skip' && !opts.includeNonFood) continue;
      var disp = cleanName(name);
      var id = idFromName(disp);
      if (seen[id]) continue;
      seen[id] = 1;
      var review = p.review_text_published || '';
      out.push({
        id: id, name: disp, cuisine: guessCuisine(disp), confidence: conf,
        price: priceFromQuestions(p.questions) || 1,
        rating: p.five_star_rating_published || 0,
        lat: coords[1], lng: coords[0],
        city: cityFromAddr(loc.address), addr: loc.address || '',
        eatCount: eatCountFromText(review),
        lastEaten: (p.date || '').slice(0, 10),
        dineIn: true, tags: [],
        blurb: review.split('\n')[0].slice(0, 40),
      });
    }
    return out;
  }

  window.GMImport = {
    guessCuisine: guessCuisine, isFood: isFood, cleanName: cleanName, cityFromAddr: cityFromAddr,
    idFromName: idFromName, priceFromQuestions: priceFromQuestions, hasSpendQuestion: hasSpendQuestion,
    classifyPlace: classifyPlace, eatCountFromText: eatCountFromText, parseGeoJSON: parseGeoJSON,
  };
})();
