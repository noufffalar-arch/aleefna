import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertTriangle, Search, X, LocateFixed, Hospital, CheckCircle2, PartyPopper } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
  contact_phone?: string; // Optional - only available for authenticated users
  resolution_type?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  // From view
  pet_name?: string;
  pet_species?: string;
  pet_photo_url?: string | null;
  // From join
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
  taken_to_clinic: boolean | null;
  clinic_name: string | null;
  clinic_notes: string | null;
  rescue_date: string | null;
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
  const { toast } = useToast();
  const { user, isGuest } = useAuth();
  const isAuthenticated = !!user && !isGuest;
  const [missingReports, setMissingReports] = useState<MissingReport[]>([]);
  const [strayReports, setStrayReports] = useState<StrayReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'missing' | 'stray'>('all');
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [foundDialogOpen, setFoundDialogOpen] = useState(false);
  const [resolutionType, setResolutionType] = useState<string>('returned_to_owner');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const handleMarkAsFound = async () => {
    if (!selectedReport || selectedReport.type !== 'missing') return;
    
    setSubmitting(true);
    const report = selectedReport.data as MissingReport;
    
    const { error } = await supabase
      .from('missing_reports')
      .update({
        status: 'found',
        resolution_type: resolutionType,
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', report.id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث البلاغ',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث حالة البلاغ - تم إيجاد الحيوان',
      });
      // Update local state
      setMissingReports(prev => 
        prev.map(r => r.id === report.id ? { ...r, status: 'found', resolution_type: resolutionType, resolution_notes: resolutionNotes } : r)
      );
      setFoundDialogOpen(false);
      setSelectedReport(null);
      setResolutionType('returned_to_owner');
      setResolutionNotes('');
    }
    setSubmitting(false);
  };

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

    // Set up realtime subscriptions for new reports
    const missingChannel = supabase
      .channel('missing-reports-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'missing_reports'
        },
        (payload) => {
          console.log('New missing report:', payload);
          // Fetch the new report with pet info
          supabase
            .from('missing_reports')
            .select('*, pets(name, species, photo_url)')
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setMissingReports(prev => [data, ...prev]);
                toast({
                  title: '🔔 بلاغ جديد!',
                  description: `تم الإبلاغ عن حيوان مفقود: ${data.pets?.name || 'حيوان أليف'}`,
                });
              }
            });
        }
      )
      .subscribe();

    const strayChannel = supabase
      .channel('stray-reports-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stray_reports'
        },
        (payload) => {
          console.log('New stray report:', payload);
          const newReport = payload.new as StrayReport;
          setStrayReports(prev => [newReport, ...prev]);
          
          const animalLabel = newReport.animal_type === 'cat' ? 'قطة' : 
                             newReport.animal_type === 'dog' ? 'كلب' : 'حيوان';
          toast({
            title: '⚠️ بلاغ حيوان ضال!',
            description: `تم الإبلاغ عن ${animalLabel} ضال في ${newReport.location_text}`,
            variant: newReport.danger_level === 'high' ? 'destructive' : 'default',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(missingChannel);
      supabase.removeChannel(strayChannel);
    };
  }, [toast]);

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
    
    if (isAuthenticated) {
      // Authenticated users get full data including phone numbers
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
      if (strayRes.data) setStrayReports(strayRes.data as StrayReport[]);
    } else {
      // Guests use public views (no phone numbers)
      const [missingRes, strayRes] = await Promise.all([
        supabase
          .from('missing_reports_map')
          .select('*'),
        supabase
          .from('stray_reports_map')
          .select('*'),
      ]);

      if (missingRes.data) {
        // Transform view data to match interface
        const transformedMissing = missingRes.data.map((r: any) => ({
          ...r,
          pets: r.pet_name ? { name: r.pet_name, species: r.pet_species, photo_url: r.pet_photo_url } : undefined
        }));
        setMissingReports(transformedMissing);
      }
      if (strayRes.data) setStrayReports(strayRes.data as StrayReport[]);
    }
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
                  
                  {/* Show status */}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">الحالة:</span>
                    {(selectedReport.data as MissingReport).status === 'found' ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        تم إيجاده
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-xs">مفقود</span>
                    )}
                  </div>

                  {/* Resolution info if found */}
                  {(selectedReport.data as MissingReport).status === 'found' && (selectedReport.data as MissingReport).resolution_type && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <PartyPopper className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-700 dark:text-green-400 text-sm">تم إيجاد الحيوان!</span>
                      </div>
                      <p className="text-sm mb-1">
                        <span className="text-muted-foreground">النتيجة: </span>
                        {(selectedReport.data as MissingReport).resolution_type === 'returned_to_owner' && 'تم إعادته لصاحبه'}
                        {(selectedReport.data as MissingReport).resolution_type === 'taken_to_clinic' && 'تم أخذه لعيادة بيطرية'}
                        {(selectedReport.data as MissingReport).resolution_type === 'taken_to_shelter' && 'تم أخذه لجمعية حيوان'}
                      </p>
                      {(selectedReport.data as MissingReport).resolution_notes && (
                        <p className="text-xs text-muted-foreground mt-2 bg-white/50 dark:bg-black/20 p-2 rounded">
                          {(selectedReport.data as MissingReport).resolution_notes}
                        </p>
                      )}
                    </div>
                  )}

                  {(selectedReport.data as MissingReport).description && (
                    <p className="text-muted-foreground text-xs mt-2">
                      {(selectedReport.data as MissingReport).description}
                    </p>
                  )}
                  
                  <div className="flex flex-col gap-2 mt-3">
                    {isAuthenticated && (selectedReport.data as MissingReport).contact_phone ? (
                      <Button className="w-full" asChild>
                        <a href={`tel:${(selectedReport.data as MissingReport).contact_phone}`}>
                          📞 اتصل بالمالك
                        </a>
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => navigate('/auth')}
                      >
                        🔒 سجل دخولك لرؤية معلومات التواصل
                      </Button>
                    )}
                    
                    {isAuthenticated && (selectedReport.data as MissingReport).status !== 'found' && (
                      <Button 
                        variant="outline" 
                        className="w-full border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => setFoundDialogOpen(true)}
                      >
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                        تم إيجاد الحيوان
                      </Button>
                    )}
                  </div>
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
                  
                  {/* Clinic Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">حالة الإنقاذ:</span>
                    {(selectedReport.data as StrayReport).taken_to_clinic ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        تم أخذه لعيادة
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-xs">لم يتم إنقاذه بعد</span>
                    )}
                  </div>

                  {/* Clinic Info */}
                  {(selectedReport.data as StrayReport).taken_to_clinic && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Hospital className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-700 dark:text-green-400 text-sm">معلومات العيادة</span>
                      </div>
                      {(selectedReport.data as StrayReport).clinic_name && (
                        <p className="text-sm mb-1">
                          <span className="text-muted-foreground">الاسم: </span>
                          {(selectedReport.data as StrayReport).clinic_name}
                        </p>
                      )}
                      {(selectedReport.data as StrayReport).rescue_date && (
                        <p className="text-sm mb-1">
                          <span className="text-muted-foreground">تاريخ الإنقاذ: </span>
                          <span dir="ltr">{new Date((selectedReport.data as StrayReport).rescue_date!).toLocaleDateString('ar-SA')}</span>
                        </p>
                      )}
                      {(selectedReport.data as StrayReport).clinic_notes && (
                        <p className="text-xs text-muted-foreground mt-2 bg-white/50 dark:bg-black/20 p-2 rounded">
                          {(selectedReport.data as StrayReport).clinic_notes}
                        </p>
                      )}
                    </div>
                  )}

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

      {/* Found Dialog */}
      <Dialog open={foundDialogOpen} onOpenChange={setFoundDialogOpen}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-green-600" />
              تم إيجاد الحيوان
            </DialogTitle>
            <DialogDescription>
              يرجى تحديد ما حدث للحيوان المفقود
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RadioGroup value={resolutionType} onValueChange={setResolutionType}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="returned_to_owner" id="returned" />
                <Label htmlFor="returned" className="cursor-pointer">تم إعادته لصاحبه</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="taken_to_clinic" id="clinic" />
                <Label htmlFor="clinic" className="cursor-pointer">تم أخذه لعيادة بيطرية</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="taken_to_shelter" id="shelter" />
                <Label htmlFor="shelter" className="cursor-pointer">تم أخذه لجمعية حيوان</Label>
              </div>
            </RadioGroup>
            
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
              <Textarea
                id="notes"
                placeholder="أضف أي ملاحظات أو تفاصيل..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setFoundDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleMarkAsFound}
              disabled={submitting}
            >
              {submitting ? 'جاري الحفظ...' : 'تأكيد'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsMap;
