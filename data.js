/* 晚餐選擇 — 餐廳資料：由 import-util.js（純程式分流，無 AI）跑過
   Google Maps「已儲存的地點 + 評論」自動產生。
   三層分流：有消費問卷或命中料理關鍵字＝餐廳；命中非餐廳關鍵字＝排除；其餘＝不確定。
   分類＝guessCuisine() 關鍵字；猜不到＝unknown（待分類 ❔）；
   價位＝評論「平均每人消費金額」換算；評分＝你的 five_star_rating；次數＝評論「吃N次」估計。
   家＝芝山站 1 號出口（僅供半徑顯示用）。 */
window.HOME_LOC = { lat: 25.1027, lng: 121.5223, label: '芝山站 1 號出口' };

window.CITIES = ["宜蘭","台北","高雄","基隆","新北","桃園","台中"];

window.CUISINES = [
  { key: 'taiwanese', label: '台式', emoji: '🥘' },
  { key: 'noodle', label: '麵食', emoji: '🍜' },
  { key: 'snack', label: '小吃', emoji: '🍢' },
  { key: 'japanese', label: '日式', emoji: '🍣' },
  { key: 'hotpot', label: '火鍋', emoji: '🍲' },
  { key: 'thai', label: '南洋', emoji: '🌶️' },
  { key: 'western', label: '西式', emoji: '🍔' },
  { key: 'breakfast', label: '早點', emoji: '🥟' },
  { key: 'poultry', label: '雞鴨鵝', emoji: '🦆' },
  { key: 'dessert', label: '冰甜', emoji: '🍧' },
  { key: 'unknown', label: '待分類', emoji: '❔' },
];

window.SEED_RESTAURANTS = [
  {"id":"gm1xzk486","name":"MR.GAPAO嘎拋先生-打拋專賣店","cuisine":"thai","price":1,"rating":5,"lat":24.1420579,"lng":120.6801008,"city":"台中","addr":"400台灣臺中市中區臺灣大道一段326號","eatCount":0,"lastEaten":"2025-11-29","dineIn":true,"tags":[],"blurb":"打拋豬味道是比較好的 不是一般那種"},
  {"id":"gmbmnd7s","name":"天天饅頭","cuisine":"breakfast","price":1,"rating":4,"lat":24.1421525,"lng":120.6799928,"city":"台中","addr":"400台灣臺中市中區台灣大道一段336巷","eatCount":1,"lastEaten":"2025-11-29","dineIn":true,"tags":[],"blurb":"寫日本饅頭 是用炸的 裡面包紅豆 第一次吃 還挺特別"},
  {"id":"gmdcuw68","name":"正老林羊肉爐 社中店","cuisine":"hotpot","price":3,"rating":5,"lat":25.0897299,"lng":121.5102752,"city":"台北","addr":"111台灣臺北市士林區社中街119號","eatCount":0,"lastEaten":"2025-12-12","dineIn":true,"tags":[],"blurb":"羊肉是新鮮的！"},
  {"id":"gm2wol88","name":"師大夜市生炒花枝羹","cuisine":"snack","price":1,"rating":5,"lat":25.0246771,"lng":121.5290762,"city":"台北","addr":"106台灣臺北市大安區龍泉里師大路39巷11號","eatCount":0,"lastEaten":"2025-11-15","dineIn":true,"tags":[],"blurb":"超級好吃！ 只是常常想到就休息"},
  {"id":"gmd4o7ec","name":"海底撈火鍋 京站店","cuisine":"hotpot","price":1,"rating":5,"lat":25.0496268,"lng":121.5169766,"city":"台北","addr":"103台灣臺北市大同區建明里承德路一段1號4 樓","eatCount":0,"lastEaten":"2025-11-01","dineIn":true,"tags":[],"blurb":"服務不錯 但這家服務生沒主動說一些食物要煮多久 例如說牛肚 不說還真的不確定"},
  {"id":"gmzm8yhi","name":"詠樂鵝肉店-延平店","cuisine":"poultry","price":1,"rating":5,"lat":25.0858255,"lng":121.5096804,"city":"台北","addr":"111台灣臺北市士林區葫東里延平北路五段300號","eatCount":0,"lastEaten":"2025-10-28","dineIn":true,"tags":[],"blurb":"非常好吃！"},
  {"id":"gm106a2li","name":"鳥杉鳴 お食事","cuisine":"japanese","price":1,"rating":4,"lat":25.126931,"lng":121.5013288,"city":"台北","addr":"112台灣臺北市北投區清江里崇仁路一段54號","eatCount":0,"lastEaten":"2025-10-18","dineIn":true,"tags":[],"blurb":"菜單給大家看看"},
  {"id":"gm14l9k33","name":"良良海南雞-石牌店","cuisine":"thai","price":1,"rating":3,"lat":25.114778,"lng":121.5158103,"city":"台北","addr":"112台灣臺北市北投區振華里東華街一段538號一樓","eatCount":0,"lastEaten":"2025-11-13","dineIn":true,"tags":[],"blurb":"菜單給大家看"},
  {"id":"gm1ymqwri","name":"東門觀光夜市","cuisine":"snack","price":1,"rating":5,"lat":24.7581411,"lng":121.7584576,"city":"宜蘭","addr":"260台灣宜蘭縣宜蘭市聖後街","eatCount":0,"lastEaten":"2025-09-28","dineIn":true,"tags":[],"blurb":"相對於羅東夜市 規模真的小很多 也沒有卜肉 糕渣"},
  {"id":"gmc1dtv0","name":"宅男蛋餅","cuisine":"breakfast","price":1,"rating":5,"lat":24.8241251,"lng":121.770546,"city":"宜蘭","addr":"262台灣宜蘭縣礁溪鄉大忠村礁溪路四段217號","eatCount":0,"lastEaten":"2025-09-28","dineIn":true,"tags":[],"blurb":"好吃的粉漿蛋餅"},
  {"id":"gm1teqic1","name":"柯氏蔥油餅","cuisine":"breakfast","price":1,"rating":5,"lat":24.8211683,"lng":121.7698167,"city":"宜蘭","addr":"262台灣宜蘭縣礁溪鄉大忠村礁溪路四段128號","eatCount":0,"lastEaten":"2025-09-28","dineIn":true,"tags":[],"blurb":"人超多！ 早上9點來 沒吃到 下次要早點到"},
  {"id":"gmvb0ecx","name":"阿宗芋冰城","cuisine":"dessert","price":1,"rating":5,"lat":24.8587861,"lng":121.8259573,"city":"宜蘭","addr":"261台灣宜蘭縣頭城鎮城東里青雲路三段267號","eatCount":0,"lastEaten":"2025-09-27","dineIn":true,"tags":[],"blurb":"各種口味都吃到了 可能沒有特別加色素 顏色看起來比較平淡 但是吃起來很舒服 人是"},
  {"id":"gmi6l83c","name":"小春礁溪店","cuisine":"unknown","price":1,"rating":5,"lat":24.827742,"lng":121.7723416,"city":"宜蘭","addr":"262台灣宜蘭縣礁溪鄉礁溪路五段德陽路口","eatCount":0,"lastEaten":"2025-09-27","dineIn":true,"tags":[],"blurb":"不錯 來這邊必吃的卜肉和糕渣 兩樣都有 附近好像只有這家有賣 連東門夜市都沒看到"},
  {"id":"gm1qeaxb1","name":"阿成·功夫蚵仔煎","cuisine":"snack","price":1,"rating":5,"lat":24.7582661,"lng":121.75862,"city":"宜蘭","addr":"260台灣宜蘭縣宜蘭市小東里聖後街8號","eatCount":0,"lastEaten":"2025-09-27","dineIn":true,"tags":[],"blurb":"菜單給大家參考"},
  {"id":"gm9zznwj","name":"正統燒馬蛋","cuisine":"snack","price":1,"rating":5,"lat":24.7580779,"lng":121.7577525,"city":"宜蘭","addr":"260台灣宜蘭縣宜蘭市慈安里東港陸橋台7線","eatCount":1,"lastEaten":"2025-09-27","dineIn":true,"tags":[],"blurb":"大排長龍！ 老闆一顆一顆慢慢壓 第一次看到這樣搞的！"},
  {"id":"gmbj66yl","name":"樂屋日本料理","cuisine":"japanese","price":1,"rating":4,"lat":24.8571857,"lng":121.8224261,"city":"宜蘭","addr":"261台灣宜蘭縣頭城鎮城西里西一巷15號","eatCount":0,"lastEaten":"2025-09-27","dineIn":true,"tags":[],"blurb":"照片有菜單 給大家參考"},
  {"id":"gmm0bdax","name":"國旗屋米干店","cuisine":"noodle","price":1,"rating":5,"lat":24.929073,"lng":121.2541166,"city":"桃園","addr":"320台灣桃園市中壢區龍平里龍平路215號","eatCount":0,"lastEaten":"2025-10-04","dineIn":true,"tags":[],"blurb":"直上菜單 給大家參考！"},
  {"id":"gmadc3dr","name":"來來米干","cuisine":"noodle","price":1,"rating":5,"lat":24.9288388,"lng":121.2536201,"city":"桃園","addr":"32093台灣桃園市中壢區龍平里龍平路203號","eatCount":4,"lastEaten":"2026-01-17","dineIn":true,"tags":[],"blurb":"吃國旗屋四次 突然想到來吃這家 竟然更好吃！"},
  {"id":"gm4e2dq4","name":"Texas Roadhouse 德州鮮切牛排 新光店","cuisine":"western","price":3,"rating":5,"lat":25.0166704,"lng":121.2132658,"city":"桃園","addr":"320台灣桃園市中壢區春德路107號2樓","eatCount":5,"lastEaten":"2025-10-05","dineIn":true,"tags":[],"blurb":"菜單直上給大家參考！"},
  {"id":"gm1qzwcnq","name":"金溫州餛飩大王","cuisine":"noodle","price":1,"rating":5,"lat":22.6244898,"lng":120.2838761,"city":"高雄","addr":"803台灣高雄市鹽埕區新樂里新樂街163巷1號","eatCount":0,"lastEaten":"2025-10-11","dineIn":true,"tags":[],"blurb":"我們都吃 榨菜肉絲乾麵+餛飩湯！"},
  {"id":"gm1xcqzbx","name":"美家鄉粄條店","cuisine":"noodle","price":2,"rating":5,"lat":22.9014565,"lng":120.5382789,"city":"高雄","addr":"843台灣高雄市美濃區瀰濃里中山路一段119號","eatCount":0,"lastEaten":"2025-10-11","dineIn":true,"tags":[],"blurb":"菜單給各位參考"},
  {"id":"gm19ife85","name":"侯記鴨肉飯","cuisine":"poultry","price":1,"rating":5,"lat":22.6347476,"lng":120.2915481,"city":"高雄","addr":"807台灣高雄市三民區千歲里自強一路201號","eatCount":0,"lastEaten":"2025-10-10","dineIn":true,"tags":[],"blurb":"米其林推薦"},
  {"id":"gmbhbju9","name":"丹丹漢堡 大昌店","cuisine":"western","price":1,"rating":5,"lat":22.6504084,"lng":120.3313764,"city":"高雄","addr":"80776台灣高雄市三民區寶珠里大昌二路475號","eatCount":4,"lastEaten":"2025-10-10","dineIn":true,"tags":[],"blurb":"吃好幾次了 很好吃！"},
  {"id":"gmnv69o2","name":"上毅美食炸雞","cuisine":"western","price":1,"rating":5,"lat":25.097251,"lng":121.7145011,"city":"基隆","addr":"206台灣基隆市七堵區正光里南興路31號","eatCount":0,"lastEaten":"2025-10-06","dineIn":true,"tags":[],"blurb":"這家雞翅雞腿 都非常好吃！"},
  {"id":"gme537bw","name":"七堵家傳營養三明治","cuisine":"breakfast","price":1,"rating":5,"lat":25.0974237,"lng":121.7144277,"city":"基隆","addr":"206台灣基隆市七堵區正光里南興路28號","eatCount":0,"lastEaten":"2025-10-06","dineIn":true,"tags":[],"blurb":"吃了N次 都特地從台北去買"},
  {"id":"gm1tr19mz","name":"六號碼頭麵店-五層豬腸湯","cuisine":"noodle","price":1,"rating":5,"lat":25.137901,"lng":121.7406608,"city":"基隆","addr":"203台灣基隆市中山區中興里中山二路47號","eatCount":4,"lastEaten":"2025-10-05","dineIn":true,"tags":[],"blurb":"直接給大家看菜單！"},
  {"id":"gms6vuk0","name":"阿國碳烤燒餅","cuisine":"breakfast","price":1,"rating":5,"lat":25.1308969,"lng":121.7387969,"city":"基隆","addr":"200台灣基隆市仁愛區文昌里忠二路64號","eatCount":3,"lastEaten":"2025-12-20","dineIn":true,"tags":[],"blurb":"吃三次了 經典味道 沒什麼好挑惕的"},
  {"id":"gmcz6a1l","name":"金包里鴨肉","cuisine":"poultry","price":1,"rating":5,"lat":25.2219698,"lng":121.6383848,"city":"新北","addr":"208台灣新北市金山區大同里金包里街104號","eatCount":3,"lastEaten":"2025-12-07","dineIn":true,"tags":[],"blurb":"不錯 吃三次了"},
  {"id":"gmuxeeqe","name":"陳記豆腐養生恬點","cuisine":"dessert","price":1,"rating":5,"lat":24.9909243,"lng":121.6603072,"city":"新北","addr":"223台灣新北市石碇區石碇里石碇東街77號","eatCount":0,"lastEaten":"2025-12-06","dineIn":true,"tags":[],"blurb":"豆腐冰沙 豆腐蛋糕 都很清爽好吃！"},
  {"id":"gm1cxb0gr","name":"馬紹米血糕","cuisine":"snack","price":1,"rating":5,"lat":24.8633164,"lng":121.5514623,"city":"新北","addr":"233台灣新北市烏來區烏來里烏來街123號","eatCount":4,"lastEaten":"2025-11-15","dineIn":true,"tags":[],"blurb":"這個非常好吃！ 為了這個來吃四次了"},
  {"id":"gmvbjhhn","name":"雅各原住民山豬肉香腸","cuisine":"snack","price":1,"rating":5,"lat":24.8625164,"lng":121.5514297,"city":"新北","addr":"233台灣新北市烏來區烏來里烏來街84號","eatCount":3,"lastEaten":"2025-11-15","dineIn":true,"tags":[],"blurb":"吃三次了 很好吃！"},
];
