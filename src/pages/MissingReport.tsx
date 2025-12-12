import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Search, MapPin, Loader2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

interface Pet {
  id: string;
  name: string;
  photo_url: string | null;
}

// Zod validation schema
const missingReportSchema = z.object({
  petId: z.string().uuid('الرجاء اختيار الحيوان'),
  lastSeenDate: z.string().min(1, 'الرجاء تحديد تاريخ ووقت آخر مشاهدة'),
  lastSeenLocation: z.string()
    .trim()
    .min(5, 'الموقع يجب أن يكون 5 أحرف على الأقل')
    .max(500, 'الموقع يجب أن لا يتجاوز 500 حرف'),
  contactPhone: z.string()
    .regex(/^05\d{8}$/, 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام'),
  description: z.string().max(2000, 'الوصف يجب أن لا يتجاوز 2000 حرف').optional(),
});

const MissingReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [lastSeenDate, setLastSeenDate] = useState('');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPetData = pets.find(p => p.id === selectedPet);

  useEffect(() => {
    if (user) fetchPets();
  }, [user]);

  const fetchPets = async () => {
    const { data } = await supabase.from('pets').select('id, name, photo_url').eq('user_id', user!.id);
    if (data) setPets(data);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;
    
    setUploadingPhoto(true);
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('report-images')
      .upload(fileName, photoFile);
    
    setUploadingPhoto(false);
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('report-images')
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

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
            setLastSeenLocation(data.display_name);
          }
        } catch {
          // If reverse geocoding fails, just set coordinates
          setLastSeenLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
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
    const result = missingReportSchema.safeParse({
      petId: selectedPet,
      lastSeenDate,
      lastSeenLocation,
      contactPhone,
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
    
    // Upload photo if no pet photo exists
    let photoUrl = selectedPetData?.photo_url || null;
    if (!photoUrl && photoFile) {
      photoUrl = await uploadPhoto();
    }
    
    // Update pet photo if uploaded
    if (photoUrl && !selectedPetData?.photo_url) {
      await supabase.from('pets').update({ photo_url: photoUrl }).eq('id', result.data.petId);
    }
    
    const { error } = await supabase.from('missing_reports').insert({
      user_id: user!.id,
      pet_id: result.data.petId,
      last_seen_date: new Date(result.data.lastSeenDate).toISOString(),
      last_seen_location: result.data.lastSeenLocation,
      description: result.data.description || null,
      contact_phone: result.data.contactPhone,
      latitude: latitude || 26.4207,
      longitude: longitude || 50.0888,
    });

    // Mark pet as missing
    await supabase.from('pets').update({ is_missing: true }).eq('id', result.data.petId);

    setLoading(false);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('missing.reportSuccess'));
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <div></div>
        <h1 className="text-xl font-bold text-foreground">{t('missing.reportTitle')}</h1>
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-4">
        <div>
          <label className="aleefna-label">{t('missing.selectPet')}</label>
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className={`w-full ${errors.petId ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="اختر الحيوان" />
            </SelectTrigger>
            <SelectContent>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.petId && <p className="text-sm text-destructive mt-1">{errors.petId}</p>}
        </div>

        {/* Pet Photo Preview or Upload */}
        <div>
          <label className="aleefna-label">صورة الحيوان</label>
          {selectedPetData?.photo_url ? (
            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-secondary">
              <img 
                src={selectedPetData.photo_url} 
                alt={selectedPetData.name} 
                className="w-full h-full object-cover"
              />
              <p className="absolute bottom-2 left-2 right-2 text-xs text-center bg-black/50 text-white py-1 px-2 rounded">
                ستظهر هذه الصورة في البلاغ
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                ref={fileInputRef}
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-secondary">
                  <img 
                    src={photoPreview} 
                    alt="معاينة" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                >
                  <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">اضغط لإضافة صورة</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="aleefna-label">{t('missing.lastSeenDate')}</label>
          <Input 
            type="datetime-local" 
            value={lastSeenDate} 
            onChange={(e) => setLastSeenDate(e.target.value)}
            className={`text-start ${errors.lastSeenDate ? 'border-destructive' : ''}`}
            dir="ltr"
          />
          {errors.lastSeenDate && <p className="text-sm text-destructive mt-1">{errors.lastSeenDate}</p>}
        </div>

        <div>
          <label className="aleefna-label">{t('missing.lastSeenLocation')}</label>
          <div className="flex gap-2">
            <Input 
              type="text" 
              value={lastSeenLocation} 
              onChange={(e) => setLastSeenLocation(e.target.value)}
              placeholder="مثال: حي الخالدية الشمالية، الدمام"
              className={`flex-1 ${errors.lastSeenLocation ? 'border-destructive' : ''}`}
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
          {errors.lastSeenLocation && <p className="text-sm text-destructive mt-1">{errors.lastSeenLocation}</p>}
          {latitude && longitude && (
            <p className="text-xs text-muted-foreground mt-1">
              📍 الإحداثيات: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
        </div>

        <div>
          <label className="aleefna-label">{t('missing.description')}</label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف إضافي للحيوان أو الظروف"
            rows={3}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="aleefna-label">{t('missing.contactPhone')}</label>
          <Input 
            type="tel" 
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            className={`text-start ${errors.contactPhone ? 'border-destructive' : ''}`}
            dir="ltr"
          />
          {errors.contactPhone && <p className="text-sm text-destructive mt-1">{errors.contactPhone}</p>}
        </div>

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          <Search className="w-5 h-5" />
          {loading ? t('common.loading') : t('missing.submitReport')}
        </Button>
      </form>
    </div>
  );
};

export default MissingReport;
