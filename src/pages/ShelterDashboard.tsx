import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PawPrint, Heart, FileText, Stethoscope, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/BottomNav';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: string | null;
  gender: string | null;
  health_status: string | null;
  is_vaccinated: boolean | null;
  is_neutered: boolean | null;
  photo_url: string | null;
  is_for_adoption: boolean | null;
}

interface AdoptionRequest {
  id: string;
  pet_id: string;
  adopter_id: string;
  status: string | null;
  message: string | null;
  created_at: string;
}

const ShelterDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [adoptablePets, setAdoptablePets] = useState<Pet[]>([]);
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'animals' | 'requests' | 'support'>('animals');
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && profile && profile.role !== 'shelter') {
      navigate('/dashboard');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAdoptablePets();
      fetchAdoptionRequests();
    }
  }, [user]);

  const fetchAdoptablePets = async () => {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_for_adoption', true);
    if (data) setAdoptablePets(data);
  };

  const fetchAdoptionRequests = async () => {
    const { data } = await supabase
      .from('adoption_requests')
      .select('*')
      .eq('shelter_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) setAdoptionRequests(data);
  };

  const firstName = profile?.full_name?.split(' ')[0] || '';

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved': return 'bg-primary/10 text-primary';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      case 'in_review': return 'bg-aleefna-orange/10 text-aleefna-orange';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="paw-logo animate-pulse-soft">
          <PawPrint className="w-10 h-10 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className={`flex items-center justify-between ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className={`flex-1 ${isRtl ? 'text-end me-4' : 'text-start ms-4'}`}>
            <h1 className="text-xl font-bold text-foreground">
              {t('dashboard.greeting')}، {firstName}
            </h1>
            <p className="text-muted-foreground text-sm">{t('shelter.dashboard')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 bg-muted rounded-xl p-1">
          <button
            onClick={() => setActiveTab('animals')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'animals' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Heart className="w-4 h-4 inline-block me-1" />
            {t('shelter.adoptableAnimals')}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'requests' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <FileText className="w-4 h-4 inline-block me-1" />
            {t('shelter.adoptionRequests')}
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'support' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Stethoscope className="w-4 h-4 inline-block me-1" />
            {t('shelter.clinicSupport')}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6">
        {activeTab === 'animals' && (
          <div className="space-y-4">
            <Button onClick={() => navigate('/add-pet?adoption=true')} className="w-full">
              <Plus className="w-5 h-5 me-2" />
              {t('shelter.addAnimal')}
            </Button>
            
            {adoptablePets.length === 0 ? (
              <div className="aleefna-card text-center py-8">
                <PawPrint className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t('adoption.noAnimals')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {adoptablePets.map((pet) => (
                  <div key={pet.id} className="aleefna-card flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                      {pet.photo_url ? (
                        <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <PawPrint className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <div className={`flex-1 ${isRtl ? 'text-end' : 'text-start'}`}>
                      <h3 className="font-bold text-foreground">{pet.name}</h3>
                      <p className="text-muted-foreground text-sm">{pet.species} • {pet.age}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {pet.is_vaccinated && (
                          <Badge variant="secondary" className="text-xs">{t('adoption.vaccinated')}</Badge>
                        )}
                        {pet.is_neutered && (
                          <Badge variant="secondary" className="text-xs">{t('adoption.neutered')}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {adoptionRequests.length === 0 ? (
              <div className="aleefna-card text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t('common.noData')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {adoptionRequests.map((request) => (
                  <div key={request.id} className="aleefna-card">
                    <div className={`flex items-center justify-between ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                      <Badge className={getStatusColor(request.status)}>
                        {t(`status.${request.status || 'new'}`)}
                      </Badge>
                      <p className="text-muted-foreground text-sm">
                        {new Date(request.created_at).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    {request.message && (
                      <p className={`text-muted-foreground text-sm mt-2 ${isRtl ? 'text-end' : 'text-start'}`}>
                        {request.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'support' && (
          <div className="aleefna-card text-center py-8">
            <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t('shelter.requestSupport')}</p>
            <Button className="mt-4" variant="outline">
              {t('shelter.requestSupport')}
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ShelterDashboard;
