import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Calendar, Phone, MessageCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

interface Pet {
  id: string;
  name: string;
}

interface Clinic {
  id: string;
  name: string;
  city: string;
  area: string | null;
  phone: string | null;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string | null;
  clinic_id: string;
}

interface TimeSlot {
  id: string;
  doctor_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

const BookAppointment = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [serviceType, setServiceType] = useState('');

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    if (user) {
      fetchPets();
      fetchClinics();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClinic) {
      fetchDoctors(selectedClinic);
      setSelectedDoctor('');
      setSelectedSlot('');
    }
  }, [selectedClinic]);

  useEffect(() => {
    if (selectedDoctor) {
      fetchSlots(selectedDoctor);
      setSelectedSlot('');
    }
  }, [selectedDoctor]);

  const fetchPets = async () => {
    const { data } = await supabase.from('pets').select('id, name').eq('user_id', user!.id);
    if (data) setPets(data);
  };

  const fetchClinics = async () => {
    const { data } = await supabase.from('clinics').select('id, name, city, area, phone');
    if (data) setClinics(data);
  };

  const fetchDoctors = async (clinicId: string) => {
    const { data } = await supabase
      .from('doctors')
      .select('id, name, specialization, clinic_id')
      .eq('clinic_id', clinicId)
      .eq('is_active', true);
    if (data) setDoctors(data);
  };

  const fetchSlots = async (doctorId: string) => {
    const { data } = await supabase
      .from('appointment_slots')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('is_booked', false)
      .gte('slot_date', new Date().toISOString().split('T')[0])
      .order('slot_date', { ascending: true });
    if (data) setSlots(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic || !serviceType || !selectedSlot || !selectedDoctor) {
      toast.error(t('doctors.fillRequired'));
      return;
    }
    setLoading(true);
    
    const slot = slots.find(s => s.id === selectedSlot);
    if (!slot) {
      toast.error(t('common.error'));
      setLoading(false);
      return;
    }

    const appointmentDate = new Date(`${slot.slot_date}T${slot.start_time}`);
    const doctor = doctors.find(d => d.id === selectedDoctor);

    // Create appointment
    const { error: appointmentError } = await supabase.from('appointments').insert({
      user_id: user!.id,
      pet_id: selectedPet || null,
      clinic_id: selectedClinic,
      doctor_id: selectedDoctor,
      service_type: serviceType,
      doctor_name: doctor?.name || null,
      appointment_date: appointmentDate.toISOString(),
    });

    if (appointmentError) {
      toast.error(t('common.error'));
      setLoading(false);
      return;
    }

    // Mark slot as booked
    const { error: slotError } = await supabase
      .from('appointment_slots')
      .update({ is_booked: true, booked_by: user!.id })
      .eq('id', selectedSlot);

    setLoading(false);
    if (slotError) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('appointment.bookSuccess'));
      navigate('/dashboard');
    }
  };

  const selectedClinicData = clinics.find(c => c.id === selectedClinic);

  const handleWhatsApp = () => {
    if (selectedClinicData?.phone) {
      const phone = selectedClinicData.phone.replace(/^0/, '966');
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };

  const handleCall = () => {
    if (selectedClinicData?.phone) {
      window.open(`tel:${selectedClinicData.phone}`, '_self');
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
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <div></div>
        <h1 className="text-xl font-bold text-foreground">{t('appointment.title')}</h1>
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-4 pb-24">
        <div>
          <label className="aleefna-label">{t('appointment.selectPet')}</label>
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('doctors.selectPetOptional')} />
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
              <SelectValue placeholder={t('doctors.selectClinic')} />
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

        {/* Contact Clinic Buttons */}
        {selectedClinicData?.phone && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleWhatsApp}>
              <MessageCircle className="w-4 h-4 me-2" />
              {t('doctors.whatsapp')}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={handleCall}>
              <Phone className="w-4 h-4 me-2" />
              {t('doctors.call')}
            </Button>
          </div>
        )}

        {/* Select Doctor */}
        {selectedClinic && (
          <div>
            <label className="aleefna-label">{t('doctors.selectDoctor')}</label>
            {doctors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">{t('doctors.noDoctorsInClinic')}</p>
            ) : (
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('doctors.selectDoctor')} />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {doctor.name} {doctor.specialization && `- ${doctor.specialization}`}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Select Time Slot */}
        {selectedDoctor && (
          <div>
            <label className="aleefna-label">{t('doctors.selectSlot')}</label>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">{t('doctors.noSlotsAvailable')}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {slots.map((slot) => (
                  <Card 
                    key={slot.id} 
                    className={`cursor-pointer transition-all ${selectedSlot === slot.id ? 'border-primary bg-primary/10' : 'hover:border-primary/50'}`}
                    onClick={() => setSelectedSlot(slot.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(slot.slot_date).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="aleefna-label">{t('appointment.serviceType')}</label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('doctors.selectService')} />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          className="w-full mt-6" 
          disabled={loading || !selectedClinic || !selectedDoctor || !selectedSlot || !serviceType}
        >
          <Calendar className="w-5 h-5 me-2" />
          {loading ? t('common.loading') : t('appointment.book')}
        </Button>
      </form>
    </div>
  );
};

export default BookAppointment;
