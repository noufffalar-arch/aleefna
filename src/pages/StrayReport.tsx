import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

// Zod validation schema
const strayReportSchema = z.object({
  animalType: z.enum(['cat', 'dog', 'other'], { required_error: 'الرجاء اختيار نوع الحيوان' }),
  dangerLevel: z.enum(['low', 'medium', 'high'], { required_error: 'الرجاء اختيار مستوى الخطورة' }),
  location: z.string().trim().min(5, 'الموقع يجب أن يكون 5 أحرف على الأقل').max(500, 'الموقع يجب أن لا يتجاوز 500 حرف'),
  description: z.string().max(2000, 'الوصف يجب أن لا يتجاوز 2000 حرف').optional(),
});

const StrayReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [animalType, setAnimalType] = useState('');
  const [dangerLevel, setDangerLevel] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('متصفحك لا يدعم تحديد الموقع');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        
        // Try to get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
          );
          const data = await response.json();
          if (data.display_name) {
            setLocation(data.display_name);
          }
        } catch {
          // If reverse geocoding fails, just set coordinates
          setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
        
        setLocationLoading(false);
        toast.success('تم تحديد موقعك بنجاح');
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('تم رفض إذن الوصول للموقع');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('معلومات الموقع غير متاحة');
            break;
          case error.TIMEOUT:
            toast.error('انتهت مهلة طلب الموقع');
            break;
          default:
            toast.error('حدث خطأ في تحديد الموقع');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = strayReportSchema.safeParse({
      animalType: animalType || undefined,
      dangerLevel: dangerLevel || undefined,
      location,
      description: description || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('الرجاء تصحيح الأخطاء في النموذج');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.from('stray_reports').insert({
      user_id: user!.id,
      animal_type: result.data.animalType,
      danger_level: result.data.dangerLevel,
      location_text: result.data.location,
      description: result.data.description || null,
      latitude: latitude || 26.4207,
      longitude: longitude || 50.0888,
    });

    setLoading(false);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.success'));
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <div></div>
        <h1 className="text-xl font-bold text-foreground">{t('stray.reportTitle')}</h1>
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-4">
        <div>
          <label className="aleefna-label">{t('stray.animalType')}</label>
          <Select value={animalType} onValueChange={setAnimalType}>
            <SelectTrigger className={`w-full ${errors.animalType ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="اختر نوع الحيوان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cat">{t('pet.cat')}</SelectItem>
              <SelectItem value="dog">{t('pet.dog')}</SelectItem>
              <SelectItem value="other">{t('pet.other')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.animalType && <p className="text-sm text-destructive mt-1">{errors.animalType}</p>}
        </div>

        <div>
          <label className="aleefna-label">{t('stray.dangerLevel')}</label>
          <Select value={dangerLevel} onValueChange={setDangerLevel}>
            <SelectTrigger className={`w-full ${errors.dangerLevel ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="اختر مستوى الخطورة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{t('stray.low')}</SelectItem>
              <SelectItem value="medium">{t('stray.medium')}</SelectItem>
              <SelectItem value="high">{t('stray.high')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.dangerLevel && <p className="text-sm text-destructive mt-1">{errors.dangerLevel}</p>}
        </div>

        <div>
          <label className="aleefna-label">{t('stray.location')}</label>
          <div className="flex gap-2">
            <Input 
              type="text" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: شارع الملك فهد، حي الخالدية"
              className={`flex-1 ${errors.location ? 'border-destructive' : ''}`}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              title="تحديد موقعي الحالي"
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </Button>
          </div>
          {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
          {latitude && longitude && (
            <p className="text-xs text-muted-foreground mt-1">
              📍 الإحداثيات: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
        </div>

        <div>
          <label className="aleefna-label">{t('stray.description')}</label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف الحيوان والموقف"
            rows={4}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
        </div>

        <Button type="submit" variant="destructive" className="w-full mt-6" disabled={loading}>
          <AlertTriangle className="w-5 h-5" />
          {loading ? t('common.loading') : t('stray.submitReport')}
        </Button>
      </form>
    </div>
  );
};

export default StrayReport;
