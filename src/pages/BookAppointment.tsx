import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Pet {
  id: string;
  name: string;
}

interface Clinic {
  id: string;
  name: string;
  city: string;
  area: string | null;
}

const BookAppointment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');

  useEffect(() => {
    if (user) {
      fetchPets();
      fetchClinics();
    }
  }, [user]);

  const fetchPets = async () => {
    const { data } = await supabase.from('pets').select('id, name').eq('user_id', user!.id);
    if (data) setPets(data);
  };

  const fetchClinics = async () => {
    const { data } = await supabase.from('clinics').select('id, name, city, area');
    if (data) setClinics(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic || !serviceType || !appointmentDate) {
      toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    
    const { error } = await supabase.from('appointments').insert({
      user_id: user!.id,
      pet_id: selectedPet || null,
      clinic_id: selectedClinic,
      service_type: serviceType,
      service_price: servicePrice ? parseFloat(servicePrice) : null,
      doctor_name: doctorName || null,
      appointment_date: new Date(appointmentDate).toISOString(),
    });

    setLoading(false);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('appointment.bookSuccess'));
      navigate('/dashboard');
    }
  };

  const serviceTypes = [
    { value: 'vaccination', label: t('appointment.vaccination') },
    { value: 'checkup', label: t('appointment.checkup') },
    { value: 'surgery', label: t('appointment.surgery') },
    { value: 'emergency', label: t('appointment.emergency') },
    { value: 'grooming', label: t('appointment.grooming') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <div></div>
        <h1 className="text-xl font-bold text-foreground">{t('appointment.title')}</h1>
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-4">
        <div>
          <label className="aleefna-label">{t('appointment.selectPet')}</label>
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر الحيوان (اختياري)" />
            </SelectTrigger>
            <SelectContent>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="aleefna-label">{t('appointment.selectClinic')}</label>
          <Select value={selectedClinic} onValueChange={setSelectedClinic}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر العيادة" />
            </SelectTrigger>
            <SelectContent>
              {clinics.map((clinic) => (
                <SelectItem key={clinic.id} value={clinic.id}>
                  {clinic.name} - {clinic.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="aleefna-label">{t('appointment.serviceType')}</label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر نوع الخدمة" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="aleefna-label">{t('appointment.servicePrice')} (اختياري)</label>
          <Input 
            type="number" 
            value={servicePrice} 
            onChange={(e) => setServicePrice(e.target.value)}
            placeholder="السعر بالريال"
            className="text-start"
            dir="ltr"
          />
        </div>

        <div>
          <label className="aleefna-label">{t('appointment.doctorName')} (اختياري)</label>
          <Input 
            type="text" 
            value={doctorName} 
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="اسم الطبيب"
          />
        </div>

        <div>
          <label className="aleefna-label">{t('appointment.dateTime')}</label>
          <Input 
            type="datetime-local" 
            value={appointmentDate} 
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="text-start"
            dir="ltr"
            required 
          />
        </div>

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          <Calendar className="w-5 h-5" />
          {loading ? t('common.loading') : t('appointment.book')}
        </Button>
      </form>
    </div>
  );
};

export default BookAppointment;
