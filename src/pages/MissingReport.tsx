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

interface Pet {
  id: string;
  name: string;
}

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

  useEffect(() => {
    if (user) fetchPets();
  }, [user]);

  const fetchPets = async () => {
    const { data } = await supabase.from('pets').select('id, name').eq('user_id', user!.id);
    if (data) setPets(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) {
      toast.error('الرجاء اختيار الحيوان');
      return;
    }
    setLoading(true);
    
    const { error } = await supabase.from('missing_reports').insert({
      user_id: user!.id,
      pet_id: selectedPet,
      last_seen_date: new Date(lastSeenDate).toISOString(),
      last_seen_location: lastSeenLocation,
      description,
      contact_phone: contactPhone,
      latitude: 26.4207, // Dammam coordinates
      longitude: 50.0888,
    });

    // Mark pet as missing
    await supabase.from('pets').update({ is_missing: true }).eq('id', selectedPet);

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
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر الحيوان" />
            </SelectTrigger>
            <SelectContent>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="aleefna-label">{t('missing.lastSeenDate')}</label>
          <Input 
            type="datetime-local" 
            value={lastSeenDate} 
            onChange={(e) => setLastSeenDate(e.target.value)}
            className="text-start"
            dir="ltr"
            required 
          />
        </div>

        <div>
          <label className="aleefna-label">{t('missing.lastSeenLocation')}</label>
          <Input 
            type="text" 
            value={lastSeenLocation} 
            onChange={(e) => setLastSeenLocation(e.target.value)}
            placeholder="مثال: حي الخالدية الشمالية، الدمام"
            required 
          />
        </div>

        <div>
          <label className="aleefna-label">{t('missing.description')}</label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف إضافي للحيوان أو الظروف"
            rows={3}
          />
        </div>

        <div>
          <label className="aleefna-label">{t('missing.contactPhone')}</label>
          <Input 
            type="tel" 
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            className="text-start"
            dir="ltr"
            required 
          />
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
