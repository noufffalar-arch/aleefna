import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const StrayReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [animalType, setAnimalType] = useState('');
  const [dangerLevel, setDangerLevel] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalType || !dangerLevel) {
      toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }
    setLoading(true);
    
    const { error } = await supabase.from('stray_reports').insert({
      user_id: user!.id,
      animal_type: animalType,
      danger_level: dangerLevel,
      location_text: location,
      description,
      latitude: 26.4207,
      longitude: 50.0888,
    });

    setLoading(false);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.success'));
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <div></div>
        <h1 className="text-xl font-bold text-foreground">{t('stray.reportTitle')}</h1>
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-4">
        <div>
          <label className="aleefna-label">{t('stray.animalType')}</label>
          <Select value={animalType} onValueChange={setAnimalType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر نوع الحيوان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cat">{t('pet.cat')}</SelectItem>
              <SelectItem value="dog">{t('pet.dog')}</SelectItem>
              <SelectItem value="other">{t('pet.other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="aleefna-label">{t('stray.dangerLevel')}</label>
          <Select value={dangerLevel} onValueChange={setDangerLevel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر مستوى الخطورة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{t('stray.low')}</SelectItem>
              <SelectItem value="medium">{t('stray.medium')}</SelectItem>
              <SelectItem value="high">{t('stray.high')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="aleefna-label">{t('stray.location')}</label>
          <Input 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
            placeholder="مثال: شارع الملك فهد، حي الخالدية"
            required 
          />
        </div>

        <div>
          <label className="aleefna-label">{t('stray.description')}</label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف الحيوان والموقف"
            rows={4}
          />
        </div>

        <Button type="submit" variant="destructive" className="w-full mt-6" disabled={loading}>
          <AlertTriangle className="w-5 h-5" />
          {loading ? t('common.loading') : t('stray.submitReport')}
        </Button>
      </form>
    </div>
  );
};

export default StrayReport;
