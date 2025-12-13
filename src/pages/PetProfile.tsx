import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCanViewPhone } from '@/hooks/useCanViewPhone';
import useRTL from '@/hooks/useRTL';
import { 
  ArrowLeft, 
  ArrowRight, 
  PawPrint, 
  Phone, 
  Edit, 
  Calendar,
  Syringe,
  AlertCircle,
  User,
  Lock,
  X,
  ZoomIn,
  Camera,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: string | null;
  gender: string | null;
  color: string | null;
  description: string | null;
  photo_url: string | null;
  health_status: string | null;
  is_vaccinated: boolean;
  is_neutered: boolean;
  is_missing: boolean;
  is_for_adoption: boolean;
  microchip_id: string | null;
  vaccinations: string[] | null;
  medical_notes: string | null;
  user_id: string;
  created_at: string;
}

interface OwnerProfile {
  full_name: string;
  phone: string | null;
  email: string | null;
}

const PetProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isRtl, dir } = useRTL();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwner = user?.id === pet?.user_id;
  
  // Pass owner ID to check if current user is the owner
  const { canViewPhone, loading: phoneLoading } = useCanViewPhone({ ownerId: pet?.user_id });

  useEffect(() => {
    if (id) {
      fetchPet();
    }
  }, [id]);

  const fetchPet = async () => {
    setLoading(true);

    try {
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (petError) {
        console.error('Error fetching pet profile:', petError);
      }

      if (!petData) {
        console.warn('Pet not found or no access for id:', id);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPet(petData as Pet);

      // Fetch owner info
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('user_id', petData.user_id)
        .maybeSingle();

      if (ownerError) {
        console.error('Error fetching owner profile:', ownerError);
      }

      if (ownerData) {
        setOwner(ownerData as OwnerProfile);
      }

      setLoading(false);
    } catch (error) {
      console.error('Unexpected error in PetProfile:', error);
      setNotFound(true);
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pet || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('common.invalidFileType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('common.fileTooLarge'));
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${pet.id}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);

      // Update pet record
      const { error: updateError } = await supabase
        .from('pets')
        .update({ photo_url: publicUrl })
        .eq('id', pet.id);

      if (updateError) throw updateError;

      // Update local state
      setPet({ ...pet, photo_url: publicUrl });
      toast.success(t('common.success'));
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="paw-logo animate-pulse-soft">
          <PawPrint className="w-10 h-10 text-primary" />
        </div>
      </div>
    );
  }

  if (notFound || !pet) {
    return (
      <div className="min-h-screen bg-background pb-24" dir={dir}>
        <div className="px-6 pt-8">
          <button onClick={() => navigate(-1)} className="mb-6">
            <BackArrow className="w-6 h-6 text-foreground" />
          </button>
          <div className="text-center py-12">
            <PawPrint className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              {t('pet.notFound')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('pet.notFoundDesc')}
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              {t('common.backToDashboard')}
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir={dir}>
      {/* Header */}
      <div className="relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        
        {/* Pet Image - Clickable */}
        <div 
          className="h-64 bg-secondary relative cursor-pointer group"
          onClick={() => pet.photo_url && setImageModalOpen(true)}
        >
          {pet.photo_url ? (
            <>
              <img 
                src={pet.photo_url} 
                alt={pet.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col gap-2">
              <PawPrint className="w-20 h-20 text-muted-foreground" />
              {isOwner && (
                <p className="text-muted-foreground text-sm">{t('pet.tapToAddPhoto')}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
        >
          <BackArrow className="w-5 h-5 text-foreground" />
        </button>

        {/* Change Photo Button (for owner only) */}
        {isOwner && (
          <button 
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            disabled={uploading}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 text-foreground animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-foreground" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-6 -mt-8 relative">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-foreground">{pet.name}</h1>
              <p className="text-muted-foreground">
                {t(`pet.${pet.species}`) || pet.species}
                {pet.breed && ` • ${pet.breed}`}
              </p>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {pet.is_missing && (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {t('pet.missing')}
                </Badge>
              )}
              {pet.is_for_adoption && (
                <Badge className="bg-primary">
                  {t('pet.forAdoption')}
                </Badge>
              )}
              {pet.is_vaccinated && (
                <Badge variant="secondary">
                  <Syringe className="w-3 h-3 mr-1" />
                  {t('adoption.vaccinated')}
                </Badge>
              )}
              {pet.is_neutered && (
                <Badge variant="secondary">
                  {t('adoption.neutered')}
                </Badge>
              )}
            </div>

            {/* Pet Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {pet.age && (
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">{t('pet.age')}</p>
                  <p className="font-medium text-foreground">{pet.age}</p>
                </div>
              )}
              {pet.gender && (
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">{t('pet.gender')}</p>
                  <p className="font-medium text-foreground">
                    {t(`pet.${pet.gender}`) || pet.gender}
                  </p>
                </div>
              )}
              {pet.color && (
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">{t('pet.color')}</p>
                  <p className="font-medium text-foreground">{pet.color}</p>
                </div>
              )}
              {pet.microchip_id && (
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-muted-foreground">{t('pet.microchipId')}</p>
                  <p className="font-medium text-foreground text-xs">{pet.microchip_id}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {pet.description && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <h3 className="font-bold text-foreground mb-2">{t('pet.description')}</h3>
              <p className="text-muted-foreground text-sm">{pet.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Medical Notes */}
        {pet.medical_notes && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <h3 className="font-bold text-foreground mb-2">{t('pet.medicalNotes')}</h3>
              <p className="text-muted-foreground text-sm">{pet.medical_notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Owner Info */}
        {owner && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <h3 className="font-bold text-foreground mb-3">{t('pet.ownerInfo')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{owner.full_name}</p>
                    <p className="text-sm text-muted-foreground">{t('pet.owner')}</p>
                  </div>
                </div>
                
                {/* Phone - hidden for regular users */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    {canViewPhone ? (
                      <Phone className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    {phoneLoading ? (
                      <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
                    ) : canViewPhone && owner.phone ? (
                      <a href={`tel:${owner.phone}`} className="font-medium text-primary">
                        {owner.phone}
                      </a>
                    ) : (
                      <p className="text-muted-foreground text-sm">{t('pet.phoneHidden')}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{t('pet.contactPhone')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons for Owner */}
        {isOwner && (
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate('/book-appointment')}
            >
              <Calendar className="w-4 h-4" />
              {t('services.bookAppointment')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-destructive text-destructive hover:bg-destructive/10" 
              onClick={() => navigate('/missing-report')}
            >
              <AlertCircle className="w-4 h-4" />
              {t('services.reportMissing')}
            </Button>
          </div>
        )}
      </div>

      <BottomNav />

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95">
          <button 
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center z-10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          {pet?.photo_url && (
            <img
              src={pet.photo_url}
              alt={pet.name}
              className="w-full h-full object-contain max-h-[90vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PetProfile;
