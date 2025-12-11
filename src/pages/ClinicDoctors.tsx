import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Plus, Trash2, User, Clock, Calendar, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  name: string;
  specialization: string | null;
  phone: string | null;
  is_active: boolean;
}

interface TimeSlot {
  id: string;
  doctor_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

type ShiftType = 'morning' | 'evening' | 'fullday';

const SHIFT_TIMES = {
  morning: { start: '08:00', end: '14:00', slots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'] },
  evening: { start: '16:00', end: '22:00', slots: ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] },
  fullday: { start: '08:00', end: '22:00', slots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'] }
};

const ClinicDoctors = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [addingDoctor, setAddingDoctor] = useState(false);
  
  const [newDoctor, setNewDoctor] = useState({ 
    name: '', 
    specialization: '', 
    phone: '',
    shift: 'morning' as ShiftType,
    daysAhead: 7
  });
  const [newSlot, setNewSlot] = useState({ slot_date: '', start_time: '', end_time: '' });

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
    const { data: clinic } = await supabase
      .from('clinics')
      .select('id')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (clinic) {
      setClinicId(clinic.id);
      await Promise.all([fetchDoctors(clinic.id), fetchSlots(clinic.id)]);
    }
    setLoadingData(false);
  };

  const fetchDoctors = async (cId: string) => {
    const { data } = await supabase
      .from('doctors')
      .select('*')
      .eq('clinic_id', cId)
      .order('created_at', { ascending: false });
    if (data) setDoctors(data);
  };

  const fetchSlots = async (cId: string) => {
    const { data } = await supabase
      .from('appointment_slots')
      .select('*')
      .eq('clinic_id', cId)
      .gte('slot_date', new Date().toISOString().split('T')[0])
      .order('slot_date', { ascending: true });
    if (data) setSlots(data);
  };

  const generateSlotsForDoctor = async (doctorId: string, shift: ShiftType, daysAhead: number) => {
    if (!clinicId) return;
    
    const slotsToInsert: { clinic_id: string; doctor_id: string; slot_date: string; start_time: string; end_time: string }[] = [];
    const shiftData = SHIFT_TIMES[shift];
    
    for (let day = 1; day <= daysAhead; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      
      // Skip Fridays (day 5)
      if (date.getDay() === 5) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      for (const slotTime of shiftData.slots) {
        const startHour = parseInt(slotTime.split(':')[0]);
        const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;
        
        slotsToInsert.push({
          clinic_id: clinicId,
          doctor_id: doctorId,
          slot_date: dateStr,
          start_time: slotTime,
          end_time: endTime
        });
      }
    }
    
    if (slotsToInsert.length > 0) {
      const { error } = await supabase.from('appointment_slots').insert(slotsToInsert);
      if (error) {
        console.error('Error generating slots:', error);
      }
    }
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name) {
      toast.error(t('doctors.doctorNameRequired'));
      return;
    }
    if (!clinicId) {
      toast.error(t('doctors.noClinicLinked'));
      return;
    }

    setAddingDoctor(true);

    const { data, error } = await supabase.from('doctors').insert({
      clinic_id: clinicId,
      name: newDoctor.name,
      specialization: newDoctor.specialization || null,
      phone: newDoctor.phone || null
    }).select().single();

    if (error) {
      console.error('Error adding doctor:', error);
      toast.error(error.message || t('common.error'));
      setAddingDoctor(false);
      return;
    }

    // Auto-generate slots for the new doctor
    if (data) {
      await generateSlotsForDoctor(data.id, newDoctor.shift, newDoctor.daysAhead);
    }

    toast.success(t('doctors.doctorAddedWithSlots'));
    setNewDoctor({ name: '', specialization: '', phone: '', shift: 'morning', daysAhead: 7 });
    setShowAddDoctor(false);
    setAddingDoctor(false);
    await Promise.all([fetchDoctors(clinicId), fetchSlots(clinicId)]);
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    const { error } = await supabase.from('doctors').delete().eq('id', doctorId);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.success'));
      if (clinicId) fetchDoctors(clinicId);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.slot_date || !newSlot.start_time || !newSlot.end_time || !selectedDoctorId || !clinicId) return;

    const { error } = await supabase.from('appointment_slots').insert({
      clinic_id: clinicId,
      doctor_id: selectedDoctorId,
      slot_date: newSlot.slot_date,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time
    });

    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.success'));
      setNewSlot({ slot_date: '', start_time: '', end_time: '' });
      setShowAddSlot(false);
      fetchSlots(clinicId);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const { error } = await supabase.from('appointment_slots').delete().eq('id', slotId);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.success'));
      if (clinicId) fetchSlots(clinicId);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <User className="w-10 h-10 text-primary" />
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
          <h1 className="text-xl font-bold">{t('doctors.title')}</h1>
        </div>
      </div>

      <div className="p-6 space-y-6 pb-24">
        {/* Doctors Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('doctors.doctorsList')}</CardTitle>
            <Dialog open={showAddDoctor} onOpenChange={setShowAddDoctor}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 me-1" />
                  {t('doctors.addDoctor')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('doctors.addDoctor')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{t('doctors.doctorName')}</Label>
                    <Input
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('doctors.doctorNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('doctors.specialization')}</Label>
                    <Input
                      value={newDoctor.specialization}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, specialization: e.target.value }))}
                      placeholder={t('doctors.specializationPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('doctors.phone')}</Label>
                    <Input
                      value={newDoctor.phone}
                      onChange={(e) => setNewDoctor(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                  
                  {/* Shift Selection */}
                  <div className="space-y-2">
                    <Label>{t('doctors.workShift')}</Label>
                    <Select 
                      value={newDoctor.shift} 
                      onValueChange={(value: ShiftType) => setNewDoctor(prev => ({ ...prev, shift: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            {t('doctors.morningShift')} (8:00 - 14:00)
                          </div>
                        </SelectItem>
                        <SelectItem value="evening">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            {t('doctors.eveningShift')} (16:00 - 22:00)
                          </div>
                        </SelectItem>
                        <SelectItem value="fullday">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {t('doctors.fullDayShift')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Days Ahead */}
                  <div className="space-y-2">
                    <Label>{t('doctors.daysAhead')}</Label>
                    <Select 
                      value={newDoctor.daysAhead.toString()} 
                      onValueChange={(value) => setNewDoctor(prev => ({ ...prev, daysAhead: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 {t('doctors.days')}</SelectItem>
                        <SelectItem value="14">14 {t('doctors.days')}</SelectItem>
                        <SelectItem value="30">30 {t('doctors.days')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{t('doctors.daysAheadHint')}</p>
                  </div>
                  
                  <Button onClick={handleAddDoctor} className="w-full" disabled={!newDoctor.name || addingDoctor}>
                    {addingDoctor ? t('common.loading') : t('common.add')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {doctors.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">{t('doctors.noDoctors')}</p>
            ) : (
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        {doctor.specialization && (
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDoctorId(doctor.id);
                          setShowAddSlot(true);
                        }}
                      >
                        <Clock className="w-4 h-4 me-1" />
                        {t('doctors.addSlot')}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteDoctor(doctor.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Slots Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('doctors.availableSlots')}</CardTitle>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">{t('doctors.noSlots')}</p>
            ) : (
              <div className="space-y-3">
                {slots.map((slot) => {
                  const doctor = doctors.find(d => d.id === slot.doctor_id);
                  return (
                    <div key={slot.id} className={`flex items-center justify-between p-3 rounded-lg ${slot.is_booked ? 'bg-destructive/10' : 'bg-secondary'}`}>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">
                            {new Date(slot.slot_date).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)} | {doctor?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {slot.is_booked ? (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                            {t('doctors.booked')}
                          </span>
                        ) : (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            {t('doctors.available')}
                          </span>
                        )}
                        {!slot.is_booked && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Slot Dialog */}
      <Dialog open={showAddSlot} onOpenChange={setShowAddSlot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('doctors.addSlot')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('doctors.slotDate')}</Label>
              <Input
                type="date"
                value={newSlot.slot_date}
                onChange={(e) => setNewSlot(prev => ({ ...prev, slot_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('doctors.startTime')}</Label>
                <Input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('doctors.endTime')}</Label>
                <Input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                  dir="ltr"
                />
              </div>
            </div>
            <Button onClick={handleAddSlot} className="w-full" disabled={!newSlot.slot_date || !newSlot.start_time || !newSlot.end_time}>
              {t('common.add')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicDoctors;
