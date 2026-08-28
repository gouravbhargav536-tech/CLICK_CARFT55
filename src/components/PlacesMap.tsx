import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { OSMPlace } from '../types';

interface PlacesMapProps {
  centerLat: number;
  centerLon: number;
  places: OSMPlace[];
  selectedPlace: OSMPlace | null;
  onSelectPlace: (place: OSMPlace) => void;
  userLocationName?: string;
}

export const PlacesMap: React.FC<PlacesMapProps> = ({
  centerLat,
  centerLon,
  places,
  selectedPlace,
  onSelectPlace,
  userLocationName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: 14,
        zoomControl: true,
      });

      // Free OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([centerLat, centerLon], mapInstanceRef.current.getZoom());
    }

    return () => {
      // Keep map instance alive for fast re-rendering
    };
  }, [centerLat, centerLon]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. User Center Location Marker (Blue Glowing Dot)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="
        width: 22px;
        height: 22px;
        background-color: #3B82F6;
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.9);
      "></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    const userMarker = L.marker([centerLat, centerLon], { icon: userIcon });
    userMarker.bindPopup(`
      <div style="font-size: 12px; font-weight: bold; color: #1E293B;">
        📍 ${userLocationName || 'Your Location'}
      </div>
    `);
    markersGroup.addLayer(userMarker);

    // 2. Add Place Markers
    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;

      let markerBg = '#10A37F'; // Emerald
      if (place.category.includes('HOTEL')) markerBg = '#8B5CF6'; // Purple
      if (place.category.includes('SHOP')) markerBg = '#F59E0B'; // Amber
      if (place.category.includes('HOSPITAL')) markerBg = '#EF4444'; // Red
      if (place.category.includes('GYM')) markerBg = '#06B6D4'; // Cyan

      const iconHtml = `<div style="
        width: ${isSelected ? '32px' : '26px'};
        height: ${isSelected ? '32px' : '26px'};
        background-color: ${markerBg};
        border: 2px solid #FFFFFF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        font-weight: bold;
        font-size: 11px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        transform: scale(${isSelected ? 1.2 : 1});
        transition: transform 0.2s;
      ">📍</div>`;

      const placeIcon = L.divIcon({
        className: 'custom-place-marker',
        html: iconHtml,
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13],
      });

      const marker = L.marker([place.lat, place.lon], { icon: placeIcon });

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 220px; color: #0F172A;">
          <div style="font-weight: bold; font-size: 13px; color: #0F172A; margin-bottom: 2px;">
            ${place.name}
          </div>
          <div style="font-size: 10px; font-weight: 700; color: ${markerBg}; text-transform: uppercase; margin-bottom: 4px;">
            ${place.category}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            ${place.address}
          </div>
          <div style="font-size: 11px; font-weight: bold; color: #2563EB; margin-bottom: 8px;">
            📏 ${place.distanceMeters < 1000 ? `${place.distanceMeters} m` : `${(place.distanceMeters / 1000).toFixed(1)} km`}
          </div>
          <a href="${place.osmUrl}" target="_blank" rel="noopener noreferrer" style="
            display: inline-block;
            background: #10A37F;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 6px;
            text-decoration: none;
          ">
            🗺️ View on OpenStreetMap
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectPlace(place);
      });

      markersGroup.addLayer(marker);
    });
  }, [centerLat, centerLon, places, selectedPlace, userLocationName, onSelectPlace]);

  // Center on selected place when changed
  useEffect(() => {
    if (selectedPlace && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedPlace.lat, selectedPlace.lon], 16, {
        duration: 1.2,
      });
    }
  }, [selectedPlace]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-[#2f2f2f] shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px] z-0" />
    </div>
  );
};
