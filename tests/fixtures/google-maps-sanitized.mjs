export function placeFeature({
  name,
  address = '100台灣台北市中正區測試路 1 號',
  lng = 121.5,
  lat = 25.04,
  rating = 4,
  date = '2026-06-05T12:34:56Z',
  review = '',
  questions = [],
}) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: {
      date,
      five_star_rating_published: rating,
      review_text_published: review,
      questions,
      location: { name, address },
    },
  };
}

export const sanitizedFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    placeFeature({
      name: '命運牛肉麵｜分店備註',
      questions: [{ question: '平均每人消費金額', selected_option: '$200–400' }],
      review: '吃三次，湯很暖。',
    }),
    placeFeature({
      name: '神祕選物店',
      address: '220台灣新北市板橋區測試路 2 號',
      lng: 121.46,
      lat: 25.01,
      rating: 0,
    }),
    placeFeature({
      name: '測試停車場',
      address: '330台灣桃園市桃園區測試路 3 號',
      lng: 121.3,
      lat: 24.99,
    }),
    placeFeature({
      name: '測試公園',
      address: '100台灣台北市中正區公園路 4 號',
      lng: 121.51,
      lat: 25.05,
    }),
    placeFeature({
      name: '命運牛肉麵',
      lng: 121.52,
      lat: 25.06,
      review: 'duplicate should be ignored',
    }),
    placeFeature({
      name: '零座標餐廳',
      lng: 0,
      lat: 0,
    }),
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [121.55, 25.07] },
      properties: { location: { address: '100台灣台北市中正區無名路 5 號' } },
    },
  ],
};
