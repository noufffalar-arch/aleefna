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
    { key: 'reportMissing', icon: Search, bgColor: 'bg-aleefna-orange-light', iconColor: 'text-aleefna-orange', path: '/missing-report' },
    { key: 'adoption', icon: Heart, bgColor: 'bg-aleefna-purple-light', iconColor: 'text-aleefna-purple', path: '/adoption' },
    { key: 'bookAppointment', icon: Calendar, bgColor: 'bg-aleefna-blue-light', iconColor: 'text-aleefna-blue', path: '/book-appointment' },
    { key: 'care', icon: Scissors, bgColor: 'bg-secondary', iconColor: 'text-primary', path: '/care' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="paw-logo animate-pulse-soft">
          <PawPrint className="w-10 h-10 text-primary" />
        </div>
      </div>
    );
  }

  // Check if user is a shelter - show different dashboard
  if (profile?.role === 'shelter') {
    navigate('/shelter-dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="text-end flex-1 me-4">
            <h1 className="text-xl font-bold text-foreground">اهلاً، {firstName}</h1>
            <p className="text-muted-foreground text-sm">{t('dashboard.helpMessage')}</p>
          </div>
        </div>
      </div>

      {/* Pet Card */}
      <div className="px-6 mb-6">
        <div 
          className="aleefna-card-hover cursor-pointer flex items-center gap-4"
          onClick={() => navigate(pets.length > 0 ? `/pet/${pets[0].id}` : '/add-pet')}
        >
          <div className="flex-1">
            {pets.length > 0 ? (
              <h3 className="font-bold text-lg text-foreground">{pets[0].name}</h3>
            ) : (
              <p className="text-muted-foreground text-sm">{t('dashboard.addPetHint')}</p>
            )}
          </div>
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
            {pets.length > 0 && pets[0].photo_url ? (
              <img src={pets[0].photo_url} alt={pets[0].name} className="w-full h-full object-cover" />
            ) : (
              <PawPrint className="w-7 h-7 text-primary" />
            )}
          </div>
        </div>
      </div>

      {/* Quick Services */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{t('common.viewAll')}</span>
          <h2 className="font-bold text-lg text-foreground">{t('dashboard.quickServices')}</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {services.map((service) => (
            <button key={service.key} onClick={() => navigate(service.path)} className="flex flex-col items-center gap-2">
              <div className={`service-icon ${service.bgColor}`}>
                <service.icon className={`w-6 h-6 ${service.iconColor}`} />
              </div>
              <span className="text-xs text-center text-foreground leading-tight">{t(`services.${service.key}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stray Report */}
      <div className="px-6 mb-6">
        <button 
          onClick={() => navigate('/stray-report')} 
          className="w-full aleefna-card flex items-center gap-4 border-aleefna-red/20"
        >
          <span className="font-semibold text-foreground flex-1 text-end">{t('services.strayReport')}</span>
          <div className="service-icon bg-aleefna-red-light">
            <AlertTriangle className="w-6 h-6 text-aleefna-red" />
          </div>
        </button>
      </div>

      {/* Lost Map Preview */}
      <div className="px-6">
        <h2 className="font-bold text-lg mb-4 text-end text-foreground">{t('dashboard.lostMap')}</h2>
        <div 
          onClick={() => navigate('/lost-map')} 
          className="aleefna-card-hover cursor-pointer h-44 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-secondary/50 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">{t('common.viewAll')}</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
