import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

interface Pet {
  id: string;
  name: string;
}

// Zod validation schema
const missingReportSchema = z.object({
  petId: z.string().uuid('الرجاء اختيار الحيوان'),
  lastSeenDate: z.string().min(1, 'الرجاء تحديد تاريخ ووقت آخر مشاهدة'),
  lastSeenLocation: z.string()
    .trim()
    .min(5, 'الموقع يجب أن يكون 5 أحرف على الأقل')
    .max(500, 'الموقع يجب أن لا يتجاوز 500 حرف'),
  contactPhone: z.string()
    .regex(/^05\d{8}$/, 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام'),
  description: z.string().max(2000, 'الوصف يجب أن لا يتجاوز 2000 حرف').optional(),
});

const MissingReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [lastSeenDate, setLastSeenDate] = useState('');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) fetchPets();
  }, [user]);

  const fetchPets = async () => {
    const { data } = await supabase.from('pets').select('id, name').eq('user_id', user!.id);
    if (data) setPets(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = missingReportSchema.safeParse({
      petId: selectedPet,
      lastSeenDate,
      lastSeenLocation,
      contactPhone,
      description: description || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('الرجاء تصحيح الأخطاء في النموذج');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.from('missing_reports').insert({
      user_id: user!.id,
      pet_id: result.data.petId,
      last_seen_date: new Date(result.data.lastSeenDate).toISOString(),
      last_seen_location: result.data.lastSeenLocation,
      description: result.data.description || null,
      contact_phone: result.data.contactPhone,
      latitude: 26.4207,
      longitude: 50.0888,
    });

    // Mark pet as missing
    await supabase.from('pets').update({ is_missing: true }).eq('id', result.data.petId);

    setLoading(false);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('missing.reportSuccess'));
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <div></div>
        <h1 className="text-xl font-bold text-foreground">{t('missing.reportTitle')}</h1>
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-4">
        <div>
          <label className="aleefna-label">{t('missing.selectPet')}</label>
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className={`w-full ${errors.petId ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="اختر الحيوان" />
            </SelectTrigger>
            <SelectContent>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.petId && <p className="text-sm text-destructive mt-1">{errors.petId}</p>}
        </div>

        <div>
          <label className="aleefna-label">{t('missing.lastSeenDate')}</label>
          <Input 
            type="datetime-local" 
            value={lastSeenDate} 
            onChange={(e) => setLastSeenDate(e.target.value)}
            className={`text-start ${errors.lastSeenDate ? 'border-destructive' : ''}`}
            dir="ltr"
          />
          {errors.lastSeenDate && <p className="text-sm text-destructive mt-1">{errors.lastSeenDate}</p>}
        </div>

        <div>
          <label className="aleefna-label">{t('missing.lastSeenLocation')}</label>
          <Input 
            type="text" 
            value={lastSeenLocation} 
            onChange={(e) => setLastSeenLocation(e.target.value)}
            placeholder="مثال: حي الخالدية الشمالية، الدمام"
            className={errors.lastSeenLocation ? 'border-destructive' : ''}
          />
          {errors.lastSeenLocation && <p className="text-sm text-destructive mt-1">{errors.lastSeenLocation}</p>}
        </div>

        <div>
          <label className="aleefna-label">{t('missing.description')}</label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف إضافي للحيوان أو الظروف"
            rows={3}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="aleefna-label">{t('missing.contactPhone')}</label>
          <Input 
            type="tel" 
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            className={`text-start ${errors.contactPhone ? 'border-destructive' : ''}`}
            dir="ltr"
          />
          {errors.contactPhone && <p className="text-sm text-destructive mt-1">{errors.contactPhone}</p>}
        </div>

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          <Search className="w-5 h-5" />
          {loading ? t('common.loading') : t('missing.submitReport')}
        </Button>
      </form>
    </div>
  );
};

export default MissingReport;
