import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MapPin, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import ImageModal from '@/components/ImageModal';

interface AdoptionPet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: string | null;
  gender: string | null;
  description: string | null;
  photo_url: string | null;
  health_status: string | null;
  is_vaccinated: boolean;
  is_neutered: boolean;
}

const Adoption = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isGuest, exitGuestMode } = useAuth();
  const [pets, setPets] = useState<AdoptionPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAdoptionPets();
  }, []);

  const fetchAdoptionPets = async () => {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('is_for_adoption', true);
    
    if (data) setPets(data);
    setLoading(false);
  };

  const handleAdoptionRequest = async (petId: string, shelterId: string) => {
    if (!user || isGuest) {
      toast.info(t('guest.requireAuth'));
      if (isGuest) exitGuestMode();
      navigate('/auth');
      return;
    }

    const { error } = await supabase.from('adoption_requests').insert({
      pet_id: petId,
      adopter_id: user.id,
      shelter_id: shelterId,
      message: 'طلب تبني جديد',
    });

    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success('تم إرسال طلب التبني بنجاح');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-xl font-bold text-end text-foreground">{t('adoption.title')}</h1>
        <p className="text-muted-foreground text-end text-sm mt-1">{t('adoption.availableAnimals')}</p>
      </div>

      <div className="px-6">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">{t('common.loading')}</div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{t('adoption.noAnimals')}</div>
        ) : (
          <div className="space-y-4">
            {pets.map((pet) => (
              <div key={pet.id} className="aleefna-card">
                <div className="flex gap-4">
                  <div 
                    className={`w-24 h-24 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0 ${pet.photo_url ? 'cursor-pointer relative group' : ''}`}
                    onClick={() => {
                      if (pet.photo_url) {
                        setImageModalUrl(pet.photo_url);
                        setImageModalOpen(true);
                      }
                    }}
                  >
                    {pet.photo_url ? (
                      <>
                        <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </>
                    ) : (
                      <Heart className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 text-end">
                    <h3 className="font-bold text-lg text-foreground">{pet.name}</h3>
                    <p className="text-muted-foreground text-sm">{t(`pet.${pet.species}`) || pet.species}</p>
                    {pet.age && <p className="text-muted-foreground text-sm">{pet.age}</p>}
                    <div className="flex gap-2 justify-end mt-2">
                      {pet.is_vaccinated && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-lg">
                          {t('adoption.vaccinated')}
                        </span>
                      )}
                      {pet.is_neutered && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-lg">
                          {t('adoption.neutered')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {pet.description && (
                  <p className="text-muted-foreground text-sm mt-3 text-end">{pet.description}</p>
                )}
                <Button 
                  className="w-full mt-4" 
                  size="sm"
                  onClick={() => handleAdoptionRequest(pet.id, pet.id)}
                >
                  <Heart className="w-4 h-4" />
                  {t('adoption.requestAdoption')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={imageModalUrl}
        alt="صورة الحيوان"
      />
    </div>
  );
};

export default Adoption;
