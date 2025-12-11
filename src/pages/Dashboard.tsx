import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { PawPrint, Search, MapPin, Calendar, Heart, Scissors, AlertTriangle, User, Eye, AlertCircle, Syringe, LogIn } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import useRTL from '@/hooks/useRTL';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Pet {
  id: string;
  name: string;
  species: string;
  photo_url: string | null;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, loading, isGuest, exitGuestMode } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [pets, setPets] = useState<Pet[]>([]);
  const { isRtl, dir } = useRTL();

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      navigate('/auth');
    }
  }, [user, loading, isGuest, navigate]);

  useEffect(() => {
    if (user) {
      fetchPets();
    }
  }, [user]);

  const fetchPets = async () => {
    const { data } = await supabase.from('pets').select('id, name, species, photo_url').eq('user_id', user!.id);
    if (data) setPets(data);
  };

  const firstName = isGuest ? t('guest.guest') : (profile?.full_name?.split(' ')[0] || '');

  const requireAuth = (path: string) => {
    if (isGuest) {
      toast.info(t('guest.requireAuth'));
      return;
    }
    navigate(path);
  };

  const handleSignUp = () => {
    exitGuestMode();
    navigate('/auth');
  };

  const services = [
    { key: 'reportMissing', icon: Search, bgColor: 'bg-aleefna-orange-light', iconColor: 'text-aleefna-orange', path: '/missing-report', requiresAuth: true },
    { key: 'adoption', icon: Heart, bgColor: 'bg-aleefna-purple-light', iconColor: 'text-aleefna-purple', path: '/adoption', requiresAuth: false },
    { key: 'bookAppointment', icon: Calendar, bgColor: 'bg-aleefna-blue-light', iconColor: 'text-aleefna-blue', path: '/book-appointment', requiresAuth: true },
    { key: 'care', icon: Scissors, bgColor: 'bg-secondary', iconColor: 'text-primary', path: '/care', requiresAuth: false },
  ];

  if (loading || (adminLoading && !isGuest)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="paw-logo animate-pulse-soft">
          <PawPrint className="w-10 h-10 text-primary" />
        </div>
      </div>
    );
  }

  // Guest users should see the dashboard without role redirects
  if (!isGuest) {
    // Check if user is an admin - redirect to admin dashboard
    if (isAdmin) {
      navigate('/admin');
      return null;
    }

    // Check if user is a shelter - show different dashboard
    if (profile?.role === 'shelter') {
      navigate('/shelter-dashboard');
      return null;
    }

    // Check if user is a clinic - show clinic dashboard
    if (profile?.role === 'clinic') {
      navigate('/clinic-dashboard');
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir={dir}>
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-start">
            <h1 className="text-xl font-bold text-foreground">{t('dashboard.greeting')}، {firstName}</h1>
            <p className="text-muted-foreground text-sm">
              {isGuest ? t('guest.welcomeMessage') : t('dashboard.helpMessage')}
            </p>
          </div>
          <button onClick={() => isGuest ? handleSignUp() : navigate('/profile')} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {isGuest ? <LogIn className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Guest Sign Up Banner */}
      {isGuest && (
        <div className="px-6 mb-6">
          <div className="aleefna-card bg-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t('guest.signUpPrompt')}</p>
                <p className="text-xs text-muted-foreground">{t('guest.signUpBenefits')}</p>
              </div>
              <Button size="sm" onClick={handleSignUp}>
                {t('auth.signup')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pet Cards - Only show for logged in users */}
      {!isGuest && (
        <div className="px-6 mb-6">
          {pets.length === 0 ? (
            <div 
              className="aleefna-card-hover cursor-pointer flex items-center gap-4"
              onClick={() => navigate('/add-pet')}
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <PawPrint className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 text-start">
                <p className="text-muted-foreground text-sm">{t('dashboard.addPetHint')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {pets.map((pet) => (
                <div 
                  key={pet.id}
                  className="aleefna-card-hover cursor-pointer"
                  onClick={() => navigate(`/pet/${pet.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
                      {pet.photo_url ? (
                        <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <PawPrint className="w-7 h-7 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 text-start">
                      <h3 className="font-bold text-lg text-foreground">{pet.name}</h3>
                      <p className="text-muted-foreground text-sm">{pet.species}</p>
                    </div>
                  </div>
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/pet/${pet.id}`); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-primary text-xs font-medium"
                    >
                      <Eye className="w-3 h-3" />
                      {t('pet.viewProfile')}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/missing-report'); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-aleefna-red-light text-aleefna-red text-xs font-medium"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {t('services.reportMissing')}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/book-appointment'); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-aleefna-blue-light text-aleefna-blue text-xs font-medium"
                    >
                      <Syringe className="w-3 h-3" />
                      {t('pet.vaccinations')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Services */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-foreground">{t('dashboard.quickServices')}</h2>
          <span className="text-sm text-muted-foreground">{t('common.viewAll')}</span>
        </div>
      <div className="grid grid-cols-4 gap-3">
          {services.map((service) => (
            <button 
              key={service.key} 
              onClick={() => service.requiresAuth ? requireAuth(service.path) : navigate(service.path)} 
              className="flex flex-col items-center gap-2"
            >
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
          onClick={() => requireAuth('/stray-report')} 
          className="w-full aleefna-card flex items-center gap-4 border-aleefna-red/20"
        >
          <div className="service-icon bg-aleefna-red-light">
            <AlertTriangle className="w-6 h-6 text-aleefna-red" />
          </div>
          <span className="font-semibold text-foreground flex-1 text-start">{t('services.strayReport')}</span>
        </button>
      </div>

      {/* Reports Map Preview */}
      <div className="px-6">
        <h2 className="font-bold text-lg mb-4 text-foreground text-start">{t('dashboard.lostMap')}</h2>
        <div 
          onClick={() => navigate('/reports-map')} 
          className="aleefna-card-hover cursor-pointer h-44 overflow-hidden relative"
        >
          {/* Map Background */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url('https://tile.openstreetmap.org/12/2400/1580.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.25,
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-transparent to-background/60" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Search className="w-5 h-5 text-white" />
                </div>
              </div>
              <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-foreground font-medium text-sm">{t('dashboard.lostMap')}</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
