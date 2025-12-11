import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  PawPrint, Calendar, Heart, User, MapPin, Phone, 
  Clock, Check, X, MessageCircle, Stethoscope, DollarSign,
  Plus, Settings, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';

interface Clinic {
  id: string;
  name: string;
  city: string;
  area: string | null;
  address: string | null;
  phone: string | null;
  services: string[] | null;
  doctor_name: string | null;
  prices: unknown;
  logo_url: string | null;
  photo_url: string | null;
}

interface Appointment {
  id: string;
  pet_id: string | null;
  user_id: string;
  service_type: string;
  service_price: number | null;
  doctor_name: string | null;
  appointment_date: string;
  status: string | null;
  notes: string | null;
  created_at: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  photo_url: string | null;
  is_for_adoption: boolean | null;
}

const ClinicDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [adoptionPets, setAdoptionPets] = useState<Pet[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'adoption' | 'settings'>('appointments');
  const [loadingData, setLoadingData] = useState(true);
  const isRtl = i18n.language === 'ar';

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
    
    // Fetch clinic info
    const { data: clinicData } = await supabase
      .from('clinics')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();
    
    if (clinicData) {
      setClinic(clinicData);
      
      // Fetch appointments for this clinic
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', clinicData.id)
        .order('appointment_date', { ascending: true });
      
      if (appointmentsData) setAppointments(appointmentsData);
    }
    
    // Fetch adoption pets (pets marked for adoption by this clinic)
    const { data: petsData } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_for_adoption', true);
    
    if (petsData) setAdoptionPets(petsData);
    
    setLoadingData(false);
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);
    
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.success'));
      fetchClinicData();
    }
  };

  const createClinic = async () => {
    const { error } = await supabase
      .from('clinics')
      .insert({
        user_id: user!.id,
        name: profile?.full_name || t('clinic.newClinic'),
        city: '',
        area: '',
        services: []
      });
    
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.success'));
      fetchClinicData();
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] || '';

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'confirmed': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-primary/10 text-primary';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-aleefna-orange/10 text-aleefna-orange';
    }
  };

  const getServicePrice = (serviceType: string) => {
    if (clinic?.prices && typeof clinic.prices === 'object' && clinic.prices !== null) {
      const prices = clinic.prices as Record<string, number>;
      if (prices[serviceType]) {
        return prices[serviceType];
      }
    }
    return null;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="paw-logo animate-pulse-soft">
          <PawPrint className="w-10 h-10 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
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
            <p className="text-muted-foreground text-sm">{t('clinic.dashboard')}</p>
          </div>
        </div>
      </div>

      {/* Clinic Info Card */}
      {clinic ? (
        <div className="px-6 mb-4">
          {/* Clinic Photo Banner */}
          {clinic.photo_url && (
            <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
              <img src={clinic.photo_url} alt={clinic.name} className="w-full h-full object-cover" />
            </div>
          )}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-lg">
                {clinic.logo_url ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                    <img src={clinic.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <Stethoscope className="w-5 h-5 text-primary" />
                )}
                {clinic.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {clinic.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{clinic.address}, {clinic.area}, {clinic.city}</span>
                </div>
              )}
              {clinic.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{clinic.phone}</span>
                </div>
              )}
              {clinic.doctor_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{t('clinic.doctor')}: {clinic.doctor_name}</span>
                </div>
              )}
              {clinic.services && clinic.services.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {clinic.services.map((service, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {t(`appointment.${service}`) || service}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="px-6 mb-4">
          <Card className="text-center py-8">
            <CardContent>
              <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">{t('clinic.noClinicData')}</p>
              <Button onClick={createClinic}>
                <Plus className="w-4 h-4 me-2" />
                {t('clinic.createClinic')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 bg-muted rounded-xl p-1">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'appointments' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Calendar className="w-4 h-4 inline-block me-1" />
            {t('clinic.appointments')}
          </button>
          <button
            onClick={() => setActiveTab('adoption')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'adoption' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Heart className="w-4 h-4 inline-block me-1" />
            {t('clinic.adoptionAnimals')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Settings className="w-4 h-4 inline-block me-1" />
            {t('clinic.settings')}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6">
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{t('clinic.noAppointments')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className={`flex items-start justify-between ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <Badge className={getStatusColor(appointment.status)}>
                          {t(`status.${appointment.status || 'pending'}`)}
                        </Badge>
                        <div className={`flex-1 ${isRtl ? 'text-end me-3' : 'text-start ms-3'}`}>
                          <p className="font-semibold text-foreground">
                            {t(`appointment.${appointment.service_type}`) || appointment.service_type}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(appointment.appointment_date).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}
                              {' - '}
                              {new Date(appointment.appointment_date).toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          {appointment.service_price && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{appointment.service_price} {t('clinic.currency')}</span>
                            </div>
                          )}
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {appointment.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          >
                            <Check className="w-4 h-4 me-1" />
                            {t('clinic.approve')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="flex-1"
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          >
                            <X className="w-4 h-4 me-1" />
                            {t('clinic.reject')}
                          </Button>
                        </div>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          >
                            <Check className="w-4 h-4 me-1" />
                            {t('clinic.markComplete')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="flex-1"
                          >
                            <MessageCircle className="w-4 h-4 me-1" />
                            {t('clinic.contact')}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'adoption' && (
          <div className="space-y-4">
            <Button onClick={() => navigate('/add-pet?adoption=true')} className="w-full">
              <Plus className="w-5 h-5 me-2" />
              {t('clinic.addAdoptionAnimal')}
            </Button>
            
            {adoptionPets.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{t('adoption.noAnimals')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {adoptionPets.map((pet) => (
                  <Card key={pet.id} className="overflow-hidden">
                    <CardContent className="p-4 flex gap-4">
                      <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                        {pet.photo_url ? (
                          <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                          <PawPrint className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      <div className={`flex-1 ${isRtl ? 'text-end' : 'text-start'}`}>
                        <h3 className="font-bold text-foreground">{pet.name}</h3>
                        <p className="text-muted-foreground text-sm">{pet.species}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {t('clinic.availableForAdoption')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('clinic.clinicSettings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{t('clinic.settingsHint')}</p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/clinic-settings')}>
                  <Settings className="w-4 h-4 me-2" />
                  {t('clinic.editClinicInfo')}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('clinic.doctorsManagement')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{t('clinic.doctorsHint')}</p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/clinic-doctors')}>
                  <Users className="w-4 h-4 me-2" />
                  {t('doctors.title')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ClinicDashboard;