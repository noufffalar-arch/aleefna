import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, PawPrint } from 'lucide-react';
import { toast } from 'sonner';

// Validation schema
const petSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  species: z.enum(['cat', 'dog', 'bird', 'other'], { errorMap: () => ({ message: 'Please select a species' }) }),
  breed: z.string().trim().max(100, 'Breed too long').optional().or(z.literal('')),
  gender: z.enum(['male', 'female']).optional().or(z.literal('')),
  age: z.string().trim().max(50, 'Age too long').optional().or(z.literal('')),
  color: z.string().trim().max(100, 'Color too long').optional().or(z.literal('')),
  microchipId: z.string().trim().max(100, 'Microchip ID too long').optional().or(z.literal('')),
  medicalNotes: z.string().trim().max(2000, 'Medical notes too long').optional().or(z.literal(''))
});

const AddPet = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [color, setColor] = useState('');
  const [microchipId, setMicrochipId] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Check if user is a shelter - their pets should automatically be for adoption
  const isShelter = profile?.role === 'shelter';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = petSchema.safeParse({
      name,
      species: species || undefined,
      breed,
      gender: gender || undefined,
      age,
      color,
      microchipId,
      medicalNotes
    });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }
    
    setLoading(true);
    
    const { error } = await supabase.from('pets').insert({
      user_id: user!.id,
      name,
      species,
      breed: breed || null,
      gender: gender || null,
      age: age || null,
      color: color || null,
      microchip_id: microchipId || null,
      medical_notes: medicalNotes || null,
      // Shelter pets are automatically marked for adoption
      is_for_adoption: isShelter,
    });

    setLoading(false);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.success'));
      navigate(isShelter ? '/shelter-dashboard' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <Button 
          type="submit" 
          form="add-pet-form"
          size="sm"
          disabled={loading}
        >
          <PawPrint className="w-4 h-4" />
          {loading ? t('common.loading') : t('common.save')}
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('pet.addPet')}</h1>
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <form id="add-pet-form" onSubmit={handleSubmit} className="px-6 space-y-4 pb-8">
        <div>
          <label className="aleefna-label">{t('pet.name')} *</label>
          <Input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: أوريو"
            required 
          />
        </div>

        <div>
          <label className="aleefna-label">{t('pet.species')} *</label>
          <Select value={species} onValueChange={setSpecies}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cat">{t('pet.cat')}</SelectItem>
              <SelectItem value="dog">{t('pet.dog')}</SelectItem>
              <SelectItem value="bird">{t('pet.bird')}</SelectItem>
              <SelectItem value="other">{t('pet.other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="aleefna-label">{t('pet.breed')}</label>
          <Input 
            type="text" 
            value={breed} 
            onChange={(e) => setBreed(e.target.value)}
            placeholder="مثال: شيرازي"
          />
        </div>

        <div>
          <label className="aleefna-label">{t('pet.gender')}</label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر الجنس" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t('pet.male')}</SelectItem>
              <SelectItem value="female">{t('pet.female')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="aleefna-label">{t('pet.age')}</label>
          <Input 
            type="text" 
            value={age} 
            onChange={(e) => setAge(e.target.value)}
            placeholder="مثال: سنتين"
          />
        </div>

        <div>
          <label className="aleefna-label">{t('pet.color')}</label>
          <Input 
            type="text" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            placeholder="مثال: أبيض وأسود"
          />
        </div>

        <div>
          <label className="aleefna-label">{t('pet.microchipId')}</label>
          <Input 
            type="text" 
            value={microchipId} 
            onChange={(e) => setMicrochipId(e.target.value)}
            placeholder="رقم الشريحة أو QR"
            className="text-start"
            dir="ltr"
          />
        </div>

        <div>
          <label className="aleefna-label">{t('pet.medicalNotes')}</label>
          <Textarea 
            value={medicalNotes} 
            onChange={(e) => setMedicalNotes(e.target.value)}
            placeholder="ملاحظات طبية أو حالات خاصة"
            rows={3}
          />
        </div>

      </form>
    </div>
  );
};

export default AddPet;
