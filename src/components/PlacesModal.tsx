import React, { useState, useEffect } from 'react';
import {
  MapPin,
  X,
  Search,
  Compass,
  Utensils,
  Hotel,
  ShoppingBag,
  Hospital,
  Dumbbell,
  ExternalLink,
  Navigation,
  RefreshCw,
  AlertCircle,
  Globe,
  Clock,
  Phone,
} from 'lucide-react';
import { OSMPlace } from '../types';
import {
  getUserLocation,
  geocodeCityOrArea,
  reverseGeocode,
  fetchNearbyPlacesOSM,
  formatDistance,
} from '../services/osmPlaces';
import { PlacesMap } from './PlacesMap';

interface PlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const PlacesModal: React.FC<PlacesModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [category, setCategory] = useState<'restaurant' | 'hotel' | 'shop' | 'hospital' | 'gym' | 'all'>('restaurant');
  const [locationName, setLocationName] = useState<string>('My Current Location');
  const [cityInput, setCityInput] = useState<string>('');
  
  const [centerLat, setCenterLat] = useState<number | null>(null);
  const [centerLon, setCenterLon] = useState<number | null>(null);

  const [places, setPlaces] = useState<OSMPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<OSMPlace | null>(null);

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto request location when opened
  useEffect(() => {
    if (!isOpen) return;

    if (initialQuery) {
      if (initialQuery.toLowerCase().includes('hotel') || initialQuery.toLowerCase().includes('होटल')) setCategory('hotel');
      else if (initialQuery.toLowerCase().includes('shop') || initialQuery.toLowerCase().includes('दुकान')) setCategory('shop');
      else if (initialQuery.toLowerCase().includes('hospital') || initialQuery.toLowerCase().includes('अस्पताल')) setCategory('hospital');
      else if (initialQuery.toLowerCase().includes('gym') || initialQuery.toLowerCase().includes('जिम')) setCategory('gym');
      else setCategory('restaurant');
    }

    if (centerLat === null || centerLon === null) {
      handleRequestGPS();
    }
  }, [isOpen, initialQuery]);

  // Fetch places whenever center or category changes
  useEffect(() => {
    if (centerLat !== null && centerLon !== null && isOpen) {
      loadPlaces(centerLat, centerLon, category);
    }
  }, [centerLat, centerLon, category, isOpen]);

  // Request GPS Location from Browser
  const handleRequestGPS = async () => {
    setIsLoadingLocation(true);
    setErrorMsg(null);
    try {
      const coords = await getUserLocation();
      setCenterLat(coords.lat);
      setCenterLon(coords.lon);

      // Reverse geocode to get city/area name
      const name = await reverseGeocode(coords.lat, coords.lon);
      setLocationName(name.split(',')[0] || 'Your Location');
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          'Location permission denied. Please enter a city or area name below.'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Search by City/Area Name using free Nominatim API
  const handleCitySearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cityInput.trim()) return;

    setIsLoadingLocation(true);
    setErrorMsg(null);
    try {
      const res = await geocodeCityOrArea(cityInput.trim());
      if (res) {
        setCenterLat(res.lat);
        setCenterLon(res.lon);
        setLocationName(res.displayName.split(',')[0]);
        setCityInput('');
      } else {
        setErrorMsg(`Could not find coordinates for "${cityInput}". Please check spelling.`);
      }
    } catch {
      setErrorMsg('City search failed. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Fetch places from Overpass API
  const loadPlaces = async (
    lat: number,
    lon: number,
    cat: 'restaurant' | 'hotel' | 'shop' | 'hospital' | 'gym' | 'all'
  ) => {
    setIsLoadingPlaces(true);
    try {
      const data = await fetchNearbyPlacesOSM(lat, lon, cat, 3500);
      setPlaces(data);
      if (data.length > 0) {
        setSelectedPlace(data[0]);
      } else {
        setSelectedPlace(null);
      }
    } catch (err: any) {
      console.warn('Failed to fetch OSM places:', err);
      setPlaces([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'restaurant', label: 'Restaurants & Cafes', icon: Utensils, color: '#10A37F' },
    { id: 'hotel', label: 'Hotels & Lodging', icon: Hotel, color: '#8B5CF6' },
    { id: 'shop', label: 'Shops & Stores', icon: ShoppingBag, color: '#F59E0B' },
    { id: 'hospital', label: 'Hospitals & Clinics', icon: Hospital, color: '#EF4444' },
    { id: 'gym', label: 'Gyms & Fitness', icon: Dumbbell, color: '#06B6D4' },
    { id: 'all', label: 'All Nearby Places', icon: Compass, color: '#3B82F6' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] sm:h-[88vh] bg-[#171717] border border-[#2f2f2f] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-[#2f2f2f] bg-[#212121] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-[#10A37F]/15 text-[#10A37F]">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#ECECF1] flex items-center space-x-2">
                <span>Nearby Places Explorer</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10A37F]/20 text-[#10A37F] font-mono uppercase tracking-wider">
                  OpenStreetMap (Free & Privacy-First)
                </span>
              </h2>
              <p className="text-xs text-[#8E8EA0]">
                Free OSM & Overpass API • No Google API key required
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#2f2f2f] hover:bg-[#3e3e3e] text-[#ECECF1] transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Bar: Geolocation & City Manual Search */}
        <div className="p-3 sm:p-4 bg-[#1a1a1a] border-b border-[#2f2f2f] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Location Status & Request GPS */}
          <div className="flex items-center space-x-2 bg-[#212121] px-3 py-2 rounded-2xl border border-[#2f2f2f] flex-1">
            <Navigation className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <div className="flex-1 truncate">
              <span className="text-[#8E8EA0] block text-[10px] uppercase font-bold tracking-wide">
                Current Location Center
              </span>
              <span className="font-bold text-[#ECECF1] truncate block">
                {locationName}
              </span>
            </div>
            <button
              onClick={handleRequestGPS}
              disabled={isLoadingLocation}
              className="px-3 py-1.5 rounded-xl bg-[#10A37F] hover:bg-[#0d8a6c] text-white font-bold flex items-center space-x-1.5 transition-all text-xs shrink-0 active:scale-95 disabled:opacity-50"
              title="Use GPS Browser Geolocation"
            >
              {isLoadingLocation ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Compass className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Use GPS</span>
            </button>
          </div>

          {/* City / Area Manual Input */}
          <form
            onSubmit={handleCitySearch}
            className="flex items-center space-x-2 bg-[#212121] px-3 py-1.5 rounded-2xl border border-[#2f2f2f] flex-1"
          >
            <Search className="w-4 h-4 text-[#8E8EA0] shrink-0" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Or enter city/area (e.g., Delhi, Connaught Place, Mumbai)..."
              className="w-full bg-transparent text-xs text-[#ECECF1] placeholder-[#8E8EA0] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoadingLocation || !cityInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-[#2f2f2f] hover:bg-[#3e3e3e] text-[#ECECF1] font-bold text-xs shrink-0 transition-all disabled:opacity-40"
            >
              Search City
            </button>
          </form>
        </div>

        {/* Category Pills Bar */}
        <div className="px-3 py-2.5 bg-[#212121] border-b border-[#2f2f2f] flex items-center space-x-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as any)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                  active
                    ? 'bg-[#10A37F] text-white shadow-lg shadow-[#10A37F]/20'
                    : 'bg-[#2f2f2f] text-[#ECECF1] hover:bg-[#3e3e3e] border border-[#3e3e3e]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Main Split Body: Map + Results List */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 p-3 sm:p-4 gap-3 overflow-hidden">
          {/* Left Column: Interactive OpenStreetMap (7 Cols Desktop, 12 Cols Mobile) */}
          <div className="md:col-span-7 h-[260px] md:h-full flex flex-col">
            {centerLat !== null && centerLon !== null ? (
              <PlacesMap
                centerLat={centerLat}
                centerLon={centerLon}
                places={places}
                selectedPlace={selectedPlace}
                onSelectPlace={(p) => setSelectedPlace(p)}
                userLocationName={locationName}
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-[#212121] border border-[#2f2f2f] flex flex-col items-center justify-center p-6 text-center text-xs text-[#8E8EA0]">
                <Globe className="w-10 h-10 mb-2 text-[#38BDF8] animate-pulse" />
                <p className="font-bold text-[#ECECF1] mb-1">Select location to load map</p>
                <p>Click "Use GPS" or enter a city name above.</p>
              </div>
            )}
          </div>

          {/* Right Column: Places List (5 Cols Desktop, 12 Cols Mobile) */}
          <div className="md:col-span-5 flex flex-col min-h-0 bg-[#212121] rounded-2xl border border-[#2f2f2f] overflow-hidden">
            <div className="px-4 py-2.5 bg-[#1f1f1f] border-b border-[#2f2f2f] flex items-center justify-between text-xs">
              <span className="font-bold text-[#ECECF1] flex items-center space-x-1.5">
                <span>Nearby Results</span>
                <span className="px-2 py-0.5 rounded-full bg-[#10A37F]/20 text-[#10A37F] font-mono text-[10px]">
                  {places.length} found
                </span>
              </span>
              {isLoadingPlaces && (
                <div className="flex items-center space-x-1 text-[#38BDF8] font-mono text-[11px]">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Fetching OSM...</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-[#3e3e3e]">
              {isLoadingPlaces && places.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8E8EA0] flex flex-col items-center justify-center h-full">
                  <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#10A37F]" />
                  <p className="font-bold text-[#ECECF1] mb-1">Querying OpenStreetMap Overpass...</p>
                  <p className="text-[11px]">Searching nearby locations without paid APIs.</p>
                </div>
              ) : places.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8E8EA0] flex flex-col items-center justify-center h-full">
                  <Compass className="w-8 h-8 mb-2 text-[#8E8EA0]" />
                  <p className="font-bold text-[#ECECF1] mb-1">No places found in this radius</p>
                  <p className="text-[11px]">Try selecting "All Nearby Places" or search a different city.</p>
                </div>
              ) : (
                places.map((place) => {
                  const isSelected = selectedPlace?.id === place.id;
                  return (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-[#10A37F]/15 border-[#10A37F] shadow-lg shadow-[#10A37F]/10'
                          : 'bg-[#171717] border-[#2f2f2f] hover:bg-[#252525]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-[#ECECF1] text-sm leading-snug truncate">
                          {place.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-[#2f2f2f] text-[#38BDF8] font-mono text-[10px] font-bold shrink-0">
                          {formatDistance(place.distanceMeters)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-[#10A37F] mb-1.5">
                        <span>{place.category}</span>
                        {place.subCategory && (
                          <>
                            <span>•</span>
                            <span className="text-[#8E8EA0]">{place.subCategory}</span>
                          </>
                        )}
                      </div>

                      <p className="text-[11px] text-[#8E8EA0] mb-2 truncate">
                        📍 {place.address}
                      </p>

                      {/* Extra details if available from OSM */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8E8EA0] mb-2">
                        {place.openingHours && (
                          <div className="flex items-center space-x-1 text-emerald-400">
                            <Clock className="w-3 h-3" />
                            <span className="truncate">{place.openingHours}</span>
                          </div>
                        )}
                        {place.phone && (
                          <div className="flex items-center space-x-1 text-sky-400">
                            <Phone className="w-3 h-3" />
                            <span>{place.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#2f2f2f]">
                        <a
                          href={place.osmUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold text-[#10A37F] hover:underline flex items-center space-x-1"
                        >
                          <span>OpenStreetMap Node</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => setSelectedPlace(place)}
                          className="px-2.5 py-1 rounded-lg bg-[#2f2f2f] hover:bg-[#3e3e3e] text-[#ECECF1] text-[10px] font-bold transition-colors"
                        >
                          Focus on Map
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
