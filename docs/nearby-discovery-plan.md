# Nearby Restaurant Discovery Plan

## Goal

Let users who do not actively use Google Maps build a useful candidate pool by choosing a common location, selecting a radius such as 1 km / 3 km / 6 km / 10 km, and importing popular nearby restaurants into the local app list.

## Recommended Data Path

Use Google Places API or the Google Maps JavaScript Places library for real restaurant discovery. Do not scrape Google Maps pages.

Preferred production shape:

- PWA asks for geolocation only after the user taps a clear action such as `使用目前位置`.
- Users can decline location and manually enter a common point, such as home, office, school, or a city/address.
- The app sends `lat`, `lng`, `radius`, and category filters to a backend endpoint.
- The backend calls Places Nearby Search / Text Search with the server-side API key, rate limits requests, and returns only the fields the app needs: name, coordinates, address, rating, price level, place id, Maps URL, and broad type/category.
- Imported nearby results are saved as app restaurants with `source: 'nearby'` or `source: 'manual'`, not as Google Takeout records.

## Why Backend Is Preferred

A pure frontend PWA can technically use a browser-restricted Google Maps API key, but the key is still visible to users. HTTP referrer restrictions help, but they do not give the same control as a backend. A backend also lets us add quota limits, abuse controls, caching, and provider switching later.

## Privacy / UX Requirements

- Location permission must be optional and requested only after user intent.
- Manual common points must be supported for users who do not want to share precise device coordinates.
- The selected common point should be stored locally first; cloud sync can be opt-in later.
- The UI should explain that this is used to search nearby restaurants within the chosen radius.
- Nearby imports must not delete Google Maps imports or manual restaurants during later Takeout imports.

## Open Provider Options

- Google Places API: best match for Google Maps data and Maps links; requires billing, quota controls, and key protection.
- Foursquare Places / Yelp Fusion: useful alternatives but still require backend key protection and may have different Taiwan coverage.
- OpenStreetMap Overpass: possible without a paid key, but popularity/rating signals are weak, so it is not ideal for “熱門餐廳”.
