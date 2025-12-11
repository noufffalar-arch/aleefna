import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MissingReport {
  id: string;
  pet_id: string;
  last_seen_location: string;
  last_seen_date: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  status: string | null;
  contact_phone: string;
  pets?: { name: string; species: string; photo_url: string | null };
}

interface StrayReport {
  id: string;
  animal_type: string;
  danger_level: string;
  location_text: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  photo_url: string | null;
  status: string | null;
  created_at: string;
}

interface MapMarkersProps {
  missingReports: MissingReport[];
  strayReports: StrayReport[];
  onSelectMissing: (report: MissingReport) => void;
  onSelectStray: (report: StrayReport) => void;
  getAnimalTypeLabel: (type: string) => string;
}

const missingPetIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background: #5B9B5B; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const strayAnimalIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MapMarkers = ({ 
  missingReports, 
  strayReports, 
  onSelectMissing, 
  onSelectStray,
  getAnimalTypeLabel 
}: MapMarkersProps) => {
  const map = useMap();

  useEffect(() => {
    const markers: L.Marker[] = [];

    // Add missing pet markers
    missingReports.forEach(report => {
      if (report.latitude && report.longitude) {
        const marker = L.marker([report.latitude, report.longitude], { icon: missingPetIcon })
          .addTo(map)
          .bindPopup(`
            <div class="text-center p-1">
              <p class="font-bold">${report.pets?.name || 'حيوان مفقود'}</p>
              <p class="text-xs text-gray-500">${report.last_seen_location}</p>
            </div>
          `);
        
        marker.on('click', () => onSelectMissing(report));
        markers.push(marker);
      }
    });

    // Add stray animal markers
    strayReports.forEach(report => {
      if (report.latitude && report.longitude) {
        const marker = L.marker([report.latitude, report.longitude], { icon: strayAnimalIcon })
          .addTo(map)
          .bindPopup(`
            <div class="text-center p-1">
              <p class="font-bold">${getAnimalTypeLabel(report.animal_type)} ضال</p>
              <p class="text-xs text-gray-500">${report.location_text}</p>
            </div>
          `);
        
        marker.on('click', () => onSelectStray(report));
        markers.push(marker);
      }
    });

    // Cleanup
    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [map, missingReports, strayReports, onSelectMissing, onSelectStray, getAnimalTypeLabel]);

  return null;
};

export default MapMarkers;
