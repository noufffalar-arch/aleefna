import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertTriangle, Search, X, LocateFixed } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface SelectedReport {
  type: 'missing' | 'stray';
  data: MissingReport | StrayReport;
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

const ReportsMap = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [missingReports, setMissingReports] = useState<MissingReport[]>([]);
  const [strayReports, setStrayReports] = useState<StrayReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'missing' | 'stray'>('all');
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const centerOnUserLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15, { animate: true });
          
          // Update or create user location marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            userMarkerRef.current = L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: `<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })
            }).addTo(mapRef.current).bindPopup('موقعك الحالي');
          }
        }
        setLocating(false);
      },
      (error) => {
        console.log('Geolocation error:', error.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default to Dammam
    const defaultLocation: [number, number] = [26.4207, 50.0888];
    
    const map = L.map(mapContainerRef.current).setView(defaultLocation, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    mapRef.current = map;

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 14);
            
            // Add user location marker
            L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: 'user-location-marker',
                html: `<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })
            }).addTo(mapRef.current).bindPopup('موقعك الحالي');
          }
        },
        (error) => {
          console.log('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading]);

  // Update markers when data or filter changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const getAnimalTypeLabel = (type: string) => {
      switch (type) {
        case 'cat': return t('pet.cat');
        case 'dog': return t('pet.dog');
        default: return t('pet.other');
      }
    };

    // Add missing pet markers
    if (filter === 'all' || filter === 'missing') {
      missingReports.forEach(report => {
        if (report.latitude && report.longitude) {
          const marker = L.marker([report.latitude, report.longitude], { icon: missingPetIcon })
            .addTo(mapRef.current!)
            .bindPopup(`
              <div style="text-align: center; padding: 4px;">
                <p style="font-weight: bold; margin: 0;">${report.pets?.name || 'حيوان مفقود'}</p>
                <p style="font-size: 12px; color: #666; margin: 0;">${report.last_seen_location}</p>
              </div>
            `);
          
          marker.on('click', () => setSelectedReport({ type: 'missing', data: report }));
          markersRef.current.push(marker);
        }
      });
    }

    // Add stray animal markers
    if (filter === 'all' || filter === 'stray') {
      strayReports.forEach(report => {
        if (report.latitude && report.longitude) {
          const marker = L.marker([report.latitude, report.longitude], { icon: strayAnimalIcon })
            .addTo(mapRef.current!)
            .bindPopup(`
              <div style="text-align: center; padding: 4px;">
                <p style="font-weight: bold; margin: 0;">${getAnimalTypeLabel(report.animal_type)} ضال</p>
                <p style="font-size: 12px; color: #666; margin: 0;">${report.location_text}</p>
              </div>
            `);
          
          marker.on('click', () => setSelectedReport({ type: 'stray', data: report }));
          markersRef.current.push(marker);
        }
      });
    }
  }, [missingReports, strayReports, filter, t]);

  const fetchReports = async () => {
    setLoading(true);
    
    const [missingRes, strayRes] = await Promise.all([
      supabase
        .from('missing_reports')
        .select('*, pets(name, species, photo_url)')
        .eq('status', 'active'),
      supabase
        .from('stray_reports')
        .select('*')
        .in('status', ['new', 'in_progress']),
    ]);

    if (missingRes.data) setMissingReports(missingRes.data);
    if (strayRes.data) setStrayReports(strayRes.data);
    setLoading(false);
  };

  const getDangerColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getAnimalTypeLabel = (type: string) => {
    switch (type) {
      case 'cat': return t('pet.cat');
      case 'dog': return t('pet.dog');
      default: return t('pet.other');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between bg-background/95 backdrop-blur-sm border-b z-10">
        <div></div>
        <h1 className="text-lg font-bold text-foreground">خريطة البلاغات</h1>
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="px-4 py-3 flex gap-2 bg-background border-b z-10">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          الكل ({missingReports.length + strayReports.length})
        </Button>
        <Button
          variant={filter === 'missing' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('missing')}
          className="gap-1"
        >
          <Search className="w-3 h-3" />
          مفقود ({missingReports.length})
        </Button>
        <Button
          variant={filter === 'stray' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => setFilter('stray')}
          className="gap-1"
        >
          <AlertTriangle className="w-3 h-3" />
          ضال ({strayReports.length})
        </Button>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: '400px' }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div ref={mapContainerRef} style={{ height: '100%', width: '100%', minHeight: '400px' }} />
        )}

        {/* My Location Button */}
        <button
          onClick={centerOnUserLocation}
          disabled={locating}
          className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-[1000] hover:bg-accent transition-colors disabled:opacity-50"
          title="موقعي الحالي"
        >
          <LocateFixed className={`w-5 h-5 text-primary ${locating ? 'animate-pulse' : ''}`} />
        </button>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-[1000]">
          <p className="text-xs font-semibold mb-2">دليل الألوان</p>
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary"></div>
              <span>حيوان مفقود</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-destructive"></div>
              <span>حيوان ضال</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>موقعك</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Report Detail Panel */}
      {selectedReport && (
        <div className="fixed inset-x-0 bottom-0 bg-background border-t rounded-t-2xl shadow-2xl z-[1001] animate-in slide-in-from-bottom max-h-[60vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {selectedReport.type === 'missing' ? (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-content">
                    <Search className="w-4 h-4 text-primary" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold">
                    {selectedReport.type === 'missing'
                      ? (selectedReport.data as MissingReport).pets?.name || 'حيوان مفقود'
                      : `${getAnimalTypeLabel((selectedReport.data as StrayReport).animal_type)} ضال`}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedReport.type === 'missing'
                      ? (selectedReport.data as MissingReport).last_seen_location
                      : (selectedReport.data as StrayReport).location_text}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedReport(null)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Image */}
            {selectedReport.type === 'missing' && (selectedReport.data as MissingReport).pets?.photo_url && (
              <img
                src={(selectedReport.data as MissingReport).pets?.photo_url!}
                alt="صورة الحيوان"
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}
            {selectedReport.type === 'stray' && (selectedReport.data as StrayReport).photo_url && (
              <img
                src={(selectedReport.data as StrayReport).photo_url!}
                alt="صورة الحيوان"
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}

            {/* Details */}
            <div className="space-y-2 text-sm">
              {selectedReport.type === 'missing' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">النوع:</span>
                    <span>{(selectedReport.data as MissingReport).pets?.species === 'cat' ? 'قطة' : 'كلب'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">آخر مشاهدة:</span>
                    <span dir="ltr">{new Date((selectedReport.data as MissingReport).last_seen_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {(selectedReport.data as MissingReport).description && (
                    <p className="text-muted-foreground text-xs mt-2">
                      {(selectedReport.data as MissingReport).description}
                    </p>
                  )}
                  <Button className="w-full mt-3" asChild>
                    <a href={`tel:${(selectedReport.data as MissingReport).contact_phone}`}>
                      📞 اتصل بالمالك
                    </a>
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">مستوى الخطورة:</span>
                    <span className={`px-2 py-0.5 rounded-full text-white text-xs ${getDangerColor((selectedReport.data as StrayReport).danger_level)}`}>
                      {(selectedReport.data as StrayReport).danger_level === 'high' ? 'عالي' : 
                       (selectedReport.data as StrayReport).danger_level === 'medium' ? 'متوسط' : 'منخفض'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ البلاغ:</span>
                    <span dir="ltr">{new Date((selectedReport.data as StrayReport).created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {(selectedReport.data as StrayReport).description && (
                    <p className="text-muted-foreground text-xs mt-2">
                      {(selectedReport.data as StrayReport).description}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsMap;
