import { OSMPlace } from '../types';

// In-Memory & LocalStorage Cache Key & Expiry
const OSM_CACHE_KEY = 'aethervoice_osm_cache_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

interface CacheItem {
  timestamp: number;
  data: OSMPlace[];
}

function getCache(key: string): OSMPlace[] | null {
  try {
    const raw = localStorage.getItem(`${OSM_CACHE_KEY}_${key}`);
    if (!raw) return null;
    const item: CacheItem = JSON.parse(raw);
    if (Date.now() - item.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(`${OSM_CACHE_KEY}_${key}`);
      return null;
    }
    return item.data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: OSMPlace[]) {
  try {
    const item: CacheItem = { timestamp: Date.now(), data };
    localStorage.setItem(`${OSM_CACHE_KEY}_${key}`, JSON.stringify(item));
  } catch {}
}

// Calculate distance between two coordinates using Haversine formula (in meters)
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Format distance human readable (e.g., 450 m or 2.3 km)
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Get User Browser Geolocation
export function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please search by city or area name.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}

// Nominatim Geocoding (search coordinates by city / area name)
export async function geocodeCityOrArea(
  query: string
): Promise<{ lat: number; lon: number; displayName: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=1&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AetherVoiceAIStudioApp/1.0',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Nominatim Reverse Geocoding
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AetherVoiceAIStudioApp/1.0',
      },
    });
    if (!res.ok) return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

// Overpass API Query for Nearby Amenities & Shops
export async function fetchNearbyPlacesOSM(
  lat: number,
  lon: number,
  category: 'restaurant' | 'hotel' | 'shop' | 'hospital' | 'gym' | 'all' = 'all',
  radiusMeters = 3000
): Promise<OSMPlace[]> {
  const cacheKey = `${lat.toFixed(3)}_${lon.toFixed(3)}_${category}_${radiusMeters}`;
  const cached = getCache(cacheKey);
  if (cached) {
    console.log('[OSM Service] Serving from cache:', cacheKey);
    return cached;
  }

  let filterClause = '';
  if (category === 'restaurant') {
    filterClause = `
      node["amenity"~"restaurant|cafe|fast_food|food_court|bakery"](around:${radiusMeters},${lat},${lon});
      way["amenity"~"restaurant|cafe|fast_food|food_court|bakery"](around:${radiusMeters},${lat},${lon});
    `;
  } else if (category === 'hotel') {
    filterClause = `
      node["tourism"~"hotel|guest_house|hostel|motel|resort"](around:${radiusMeters},${lat},${lon});
      way["tourism"~"hotel|guest_house|hostel|motel|resort"](around:${radiusMeters},${lat},${lon});
    `;
  } else if (category === 'shop') {
    filterClause = `
      node["shop"](around:${radiusMeters},${lat},${lon});
      way["shop"](around:${radiusMeters},${lat},${lon});
    `;
  } else if (category === 'hospital') {
    filterClause = `
      node["amenity"~"hospital|clinic|pharmacy|doctors"](around:${radiusMeters},${lat},${lon});
      way["amenity"~"hospital|clinic|pharmacy"](around:${radiusMeters},${lat},${lon});
    `;
  } else if (category === 'gym') {
    filterClause = `
      node["leisure"~"fitness_centre|sports_centre|sports_hall"](around:${radiusMeters},${lat},${lon});
      way["leisure"~"fitness_centre|sports_centre|sports_hall"](around:${radiusMeters},${lat},${lon});
    `;
  } else {
    filterClause = `
      node["amenity"~"restaurant|cafe|fast_food|hospital|pharmacy|bank|cinema"](around:${radiusMeters},${lat},${lon});
      node["tourism"~"hotel|guest_house|hostel"](around:${radiusMeters},${lat},${lon});
      node["shop"](around:${radiusMeters},${lat},${lon});
      node["leisure"~"fitness_centre|park"](around:${radiusMeters},${lat},${lon});
    `;
  }

  const query = `[out:json][timeout:25];
    (
      ${filterClause}
    );
    out center 40;`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!res.ok) {
      throw new Error(`Overpass API response status ${res.status}`);
    }

    const data = await res.json();
    const elements = data.elements || [];

    const places: OSMPlace[] = [];

    for (const el of elements) {
      const tags = el.tags || {};
      const elLat = el.lat || (el.center && el.center.lat);
      const elLon = el.lon || (el.center && el.center.lon);

      if (!elLat || !elLon) continue;

      const name = tags.name || tags['name:en'] || tags['name:hi'] || tags.brand || 'Unnamed Place';
      if (name === 'Unnamed Place' && !tags.shop && !tags.amenity && !tags.tourism) continue;

      let catName = 'Place';
      if (tags.amenity) catName = tags.amenity.replace('_', ' ');
      else if (tags.tourism) catName = tags.tourism.replace('_', ' ');
      else if (tags.shop) catName = `Shop: ${tags.shop.replace('_', ' ')}`;
      else if (tags.leisure) catName = tags.leisure.replace('_', ' ');

      const dist = calculateHaversineDistance(lat, lon, elLat, elLon);

      // Build address line
      const addrParts = [];
      if (tags['addr:street']) addrParts.push(tags['addr:street']);
      if (tags['addr:suburb']) addrParts.push(tags['addr:suburb']);
      if (tags['addr:city']) addrParts.push(tags['addr:city']);
      if (tags['addr:postcode']) addrParts.push(tags['addr:postcode']);
      const address = addrParts.length > 0 ? addrParts.join(', ') : `${elLat.toFixed(4)}, ${elLon.toFixed(4)}`;

      const osmType = el.type as 'node' | 'way' | 'relation';
      const osmId = el.id;

      places.push({
        id: `${osmType}_${osmId}`,
        osmType,
        osmId,
        name,
        category: catName.toUpperCase(),
        subCategory: tags.cuisine || tags.shop || tags.amenity,
        lat: elLat,
        lon: elLon,
        address,
        distanceMeters: dist,
        osmUrl: `https://www.openstreetmap.org/${osmType}/${osmId}`,
        phone: tags.phone || tags['contact:phone'],
        website: tags.website || tags['contact:website'],
        openingHours: tags.opening_hours,
      });
    }

    // Sort by nearest distance first
    places.sort((a, b) => a.distanceMeters - b.distanceMeters);

    const result = places.slice(0, 30);
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('[OSM Service] Overpass query failed:', err);
    return [];
  }
}

// Detection helper to test if user input is asking about nearby places
export function isLocationSearchQuery(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const keywords = [
    'nearby',
    'near me',
    'restaurants near',
    'hotels near',
    'shops near',
    'hospitals near',
    'gyms near',
    'places near',
    'पास के',
    'आस-पास',
    'आस पास',
    'पास का',
    'मेरे पास',
    'होटल',
    'रेस्टोरेंट',
    'अस्पताल',
    'दुकान',
    'location',
    'where is',
    'find near',
    'closest',
    'near by',
  ];
  return keywords.some((kw) => lower.includes(kw));
}

// Classify query intent category
export function extractCategoryFromQuery(
  text: string
): 'restaurant' | 'hotel' | 'shop' | 'hospital' | 'gym' | 'all' {
  const lower = text.toLowerCase();
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('cafe') || lower.includes('रेस्टोरेंट') || lower.includes('खाना') || lower.includes('कैफे')) {
    return 'restaurant';
  }
  if (lower.includes('hotel') || lower.includes('stay') || lower.includes('resort') || lower.includes('होटल') || lower.includes('रहने')) {
    return 'hotel';
  }
  if (lower.includes('shop') || lower.includes('store') || lower.includes('market') || lower.includes('दुकान') || lower.includes('बाजार')) {
    return 'shop';
  }
  if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('doctor') || lower.includes('pharmacy') || lower.includes('अस्पताल') || lower.includes('डॉक्टर') || lower.includes('दवा')) {
    return 'hospital';
  }
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('sports') || lower.includes('जिम')) {
    return 'gym';
  }
  return 'all';
}
