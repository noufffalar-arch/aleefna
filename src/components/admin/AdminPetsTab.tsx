import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PawPrint } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  age: string | null;
  is_for_adoption: boolean;
  is_missing: boolean;
  created_at: string;
  user_id: string;
}

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string | null;
}

interface AdminPetsTabProps {
  isRtl: boolean;
}

const AdminPetsTab = ({ isRtl }: AdminPetsTabProps) => {
  const { t } = useTranslation();
  const [pets, setPets] = useState<Pet[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpecies, setFilterSpecies] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      const [petsResponse, usersResponse] = await Promise.all([
        supabase.from('pets').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('user_id, full_name, email')
      ]);

      if (!petsResponse.error) {
        setPets(petsResponse.data || []);
      }
      if (!usersResponse.error) {
        setUsers(usersResponse.data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const getOwnerName = (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    return user?.full_name || user?.email || '-';
  };

  const getSpeciesLabel = (species: string) => {
    const labels: Record<string, string> = {
      cat: t('pet.cat'),
      dog: t('pet.dog'),
      bird: t('pet.bird'),
      other: t('pet.other'),
    };
    return labels[species] || species;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredPets = filterSpecies === 'all' 
    ? pets 
    : pets.filter(pet => pet.species === filterSpecies);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PawPrint className="h-5 w-5 text-primary" />
            {t('admin.totalPets')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{pets.length}</p>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{t('admin.filterBySpecies')}:</span>
        <Select value={filterSpecies} onValueChange={setFilterSpecies}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allSpecies')}</SelectItem>
            <SelectItem value="cat">{t('pet.cat')}</SelectItem>
            <SelectItem value="dog">{t('pet.dog')}</SelectItem>
            <SelectItem value="bird">{t('pet.bird')}</SelectItem>
            <SelectItem value="other">{t('pet.other')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pets Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.petsList')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pet.name')}</TableHead>
                  <TableHead>{t('pet.species')}</TableHead>
                  <TableHead>{t('pet.breed')}</TableHead>
                  <TableHead>{t('admin.owner')}</TableHead>
                  <TableHead>{t('admin.status')}</TableHead>
                  <TableHead>{t('admin.registrationDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('admin.noPets')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPets.map((pet) => (
                    <TableRow key={pet.id}>
                      <TableCell className="font-medium">{pet.name}</TableCell>
                      <TableCell>{getSpeciesLabel(pet.species)}</TableCell>
                      <TableCell>{pet.breed || '-'}</TableCell>
                      <TableCell>{getOwnerName(pet.user_id)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {pet.is_for_adoption && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {t('admin.forAdoption')}
                            </span>
                          )}
                          {pet.is_missing && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {t('admin.missing')}
                            </span>
                          )}
                          {!pet.is_for_adoption && !pet.is_missing && (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(pet.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPetsTab;
