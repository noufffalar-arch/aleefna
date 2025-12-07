import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PawPrint, Search, MapPin, Calendar, Heart, Scissors, AlertTriangle, User } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface Pet {
  id: string;
  name: string;
  species: string;
  photo_url: string | null;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPets();
    }
  }, [user]);

  const fetchPets = async () => {
    const { data } = await supabase.from('pets').select('id, name, species, photo_url').eq('user_id', user!.id);
    if (data) setPets(data);
  };

  const firstName = profile?.full_name?.split(' ')[0] || '';

  const services = [
    { key: 'reportMissing', icon: Search, color: 'bg-aleefna-orange-light', iconColor: 'text-aleefna-orange', path: '/missing-report' },
    { key: 'adoption', icon: Heart, color: 'bg-aleefna-purple-light', iconColor: 'text-aleefna-purple', path: '/adoption' },
    { key: 'bookAppointment', icon: Calendar, color: 'bg-aleefna-blue-light', iconColor: 'text-aleefna-blue', path: '/book-appointment' },
    { key: 'care', icon: Scissors, color: 'bg-secondary', iconColor: 'text-primary', path: '/care' },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>;
  }

  // Check if user is a shelter - show different dashboard
  if (profile?.role === 'shelter') {
    navigate('/shelter-dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="aleefna-gradient-bg px-6 pt-8 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('dashboard.greeting')}، {firstName}</h1>
            <p className="text-muted-foreground text-sm">{t('dashboard.helpMessage')}</p>
          </div>
          <button onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Pet Card */}
        <div className="aleefna-card-hover cursor-pointer" onClick={() => navigate(pets.length > 0 ? `/pet/${pets[0].id}` : '/add-pet')}>
          {pets.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
                {pets[0].photo_url ? (
                  <img src={pets[0].photo_url} alt={pets[0].name} className="w-full h-full object-cover" />
                ) : (
                  <PawPrint className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">{pets[0].name}</h3>
                <p className="text-muted-foreground text-sm">{t(`pet.${pets[0].species}`) || pets[0].species}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                <PawPrint className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">{t('dashboard.addPetHint')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Services */}
      <div className="px-6 mt-6">
        <h2 className="font-bold text-lg mb-4">{t('dashboard.quickServices')}</h2>
        <div className="grid grid-cols-4 gap-3">
          {services.map((service) => (
            <button key={service.key} onClick={() => navigate(service.path)} className="flex flex-col items-center gap-2">
              <div className={`service-icon ${service.color}`}>
                <service.icon className={`w-6 h-6 ${service.iconColor}`} />
              </div>
              <span className="text-xs text-center text-foreground">{t(`services.${service.key}`)}</span>
            </button>
          ))}
        </div>

        {/* Stray Report Button */}
        <button onClick={() => navigate('/stray-report')} className="w-full mt-4 aleefna-card flex items-center gap-4 border-aleefna-red/30">
          <div className="service-icon bg-aleefna-red-light">
            <AlertTriangle className="w-6 h-6 text-aleefna-red" />
          </div>
          <span className="font-semibold">{t('services.strayReport')}</span>
        </button>
      </div>

      {/* Lost Map Preview */}
      <div className="px-6 mt-6">
        <h2 className="font-bold text-lg mb-4">{t('dashboard.lostMap')}</h2>
        <div onClick={() => navigate('/lost-map')} className="aleefna-card-hover cursor-pointer h-40 flex items-center justify-center bg-secondary/50">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">{t('common.viewAll')}</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
