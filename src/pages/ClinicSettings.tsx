import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Save, Plus, X, Stethoscope, Camera, ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ClinicData {
  id?: string;
  name: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  doctor_name: string;
  services: string[];
  prices: Record<string, number>;
  logo_url: string;
  photo_url: string;
}

const SERVICE_OPTIONS = [
  'vaccination',
  'checkup',
  'surgery',
  'emergency',
  'grooming'
];

const ClinicSettings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [clinicData, setClinicData] = useState<ClinicData>({
    name: '',
    city: '',
    area: '',
    address: '',
    phone: '',
    doctor_name: '',
    services: [],
    prices: {},
    logo_url: '',
    photo_url: ''
  });

  const isRtl = i18n.language === 'ar';
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && profile && profile.role !== 'clinic') {
      navigate('/dashboard');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user && profile?.role === 'clinic') {
      fetchClinicData();
    }
  }, [user, profile]);

  const fetchClinicData = async () => {
    setLoadingData(true);
    const { data } = await supabase
      .from('clinics')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setClinicData({
        id: data.id,
        name: data.name || '',
        city: data.city || '',
        area: data.area || '',
        address: data.address || '',
        phone: data.phone || '',
        doctor_name: data.doctor_name || '',
        services: data.services || [],
        prices: (data.prices as Record<string, number>) || {},
        logo_url: data.logo_url || '',
        photo_url: data.photo_url || ''
      });
    }
    setLoadingData(false);
  };

  const uploadImage = async (file: File, type: 'logo' | 'photo') => {
    if (!user) return;
    
    const isLogo = type === 'logo';
    isLogo ? setUploadingLogo(true) : setUploadingPhoto(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('clinic-images')
      .upload(fileName, file, { upsert: true });
    
    if (uploadError) {
      toast.error(t('common.error'));
      isLogo ? setUploadingLogo(false) : setUploadingPhoto(false);
      return;
    }
    
    const { data: urlData } = supabase.storage
      .from('clinic-images')
      .getPublicUrl(fileName);
    
    setClinicData(prev => ({
      ...prev,
      [isLogo ? 'logo_url' : 'photo_url']: urlData.publicUrl
    }));
    
    isLogo ? setUploadingLogo(false) : setUploadingPhoto(false);
    toast.success(t('clinicSettings.imageUploaded'));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, 'logo');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, 'photo');
  };

  const handleSave = async () => {
    setSaving(true);

    const dataToSave = {
      name: clinicData.name,
      city: clinicData.city,
      area: clinicData.area,
      address: clinicData.address,
      phone: clinicData.phone,
      doctor_name: clinicData.doctor_name,
      services: clinicData.services,
      prices: clinicData.prices,
      logo_url: clinicData.logo_url,
      photo_url: clinicData.photo_url,
      user_id: user!.id
    };

    let error;
    if (clinicData.id) {
      const result = await supabase
        .from('clinics')
        .update(dataToSave)
        .eq('id', clinicData.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('clinics')
        .insert(dataToSave);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.success'));
      navigate('/clinic-dashboard');
    }
  };

  const toggleService = (service: string) => {
    setClinicData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const updatePrice = (service: string, price: string) => {
    setClinicData(prev => ({
      ...prev,
      prices: {
        ...prev.prices,
        [service]: parseFloat(price) || 0
      }
    }));
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <Stethoscope className="w-10 h-10 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/clinic-dashboard')}
            className="text-primary-foreground hover:bg-primary/80"
          >
            <BackArrow className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{t('clinicSettings.title')}</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>{t('clinicSettings.images')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>{t('clinicSettings.logo')}</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <div className="animate-pulse">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                  ) : clinicData.logo_url ? (
                    <img src={clinicData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Stethoscope className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t('clinicSettings.logoHint')}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    <Camera className="w-4 h-4 me-2" />
                    {t('clinicSettings.uploadLogo')}
                  </Button>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            {/* Clinic Photo Upload */}
            <div className="space-y-2">
              <Label>{t('clinicSettings.clinicPhoto')}</Label>
              <div 
                className="w-full h-40 rounded-xl bg-secondary flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors"
                onClick={() => photoInputRef.current?.click()}
              >
                {uploadingPhoto ? (
                  <div className="animate-pulse">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">{t('common.loading')}</p>
                  </div>
                ) : clinicData.photo_url ? (
                  <img src={clinicData.photo_url} alt="Clinic" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">{t('clinicSettings.clickToUpload')}</p>
                  </>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('clinicSettings.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('clinicSettings.clinicName')}</Label>
              <Input
                value={clinicData.name}
                onChange={(e) => setClinicData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('clinicSettings.clinicNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('clinicSettings.doctorName')}</Label>
              <Input
                value={clinicData.doctor_name}
                onChange={(e) => setClinicData(prev => ({ ...prev, doctor_name: e.target.value }))}
                placeholder={t('clinicSettings.doctorNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('clinicSettings.phone')}</Label>
              <Input
                type="tel"
                value={clinicData.phone}
                onChange={(e) => setClinicData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>{t('clinicSettings.location')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('clinicSettings.city')}</Label>
              <Input
                value={clinicData.city}
                onChange={(e) => setClinicData(prev => ({ ...prev, city: e.target.value }))}
                placeholder={t('clinicSettings.cityPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('clinicSettings.area')}</Label>
              <Input
                value={clinicData.area}
                onChange={(e) => setClinicData(prev => ({ ...prev, area: e.target.value }))}
                placeholder={t('clinicSettings.areaPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('clinicSettings.address')}</Label>
              <Input
                value={clinicData.address}
                onChange={(e) => setClinicData(prev => ({ ...prev, address: e.target.value }))}
                placeholder={t('clinicSettings.addressPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>{t('clinicSettings.services')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('clinicSettings.selectServices')}</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((service) => (
                <Badge
                  key={service}
                  variant={clinicData.services.includes(service) ? "default" : "outline"}
                  className="cursor-pointer py-2 px-3"
                  onClick={() => toggleService(service)}
                >
                  {clinicData.services.includes(service) && (
                    <X className="w-3 h-3 me-1" />
                  )}
                  {!clinicData.services.includes(service) && (
                    <Plus className="w-3 h-3 me-1" />
                  )}
                  {t(`appointment.${service}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prices */}
        {clinicData.services.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('clinicSettings.prices')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('clinicSettings.setPrices')}</p>
              {clinicData.services.map((service) => (
                <div key={service} className="flex items-center gap-3">
                  <Label className="flex-1">{t(`appointment.${service}`)}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={clinicData.prices[service] || ''}
                      onChange={(e) => updatePrice(service, e.target.value)}
                      placeholder="0"
                      className="w-24"
                      dir="ltr"
                    />
                    <span className="text-sm text-muted-foreground">{t('clinic.currency')}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving || !clinicData.name}
          className="w-full"
          size="lg"
        >
          {saving ? (
            t('common.loading')
          ) : (
            <>
              <Save className="w-5 h-5 me-2" />
              {t('common.save')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ClinicSettings;