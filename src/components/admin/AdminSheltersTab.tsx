import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

interface AdminSheltersTabProps {
  users: UserProfile[];
  isRtl: boolean;
}

const AdminSheltersTab = ({ users, isRtl }: AdminSheltersTabProps) => {
  const { t } = useTranslation();

  const shelters = users.filter(user => user.role === 'shelter');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            {t('admin.totalShelters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{shelters.length}</p>
        </CardContent>
      </Card>

      {/* Shelters Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.sheltersList')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.name')}</TableHead>
                  <TableHead>{t('admin.email')}</TableHead>
                  <TableHead>{t('admin.phone')}</TableHead>
                  <TableHead>{t('admin.registrationDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shelters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {t('admin.noShelters')}
                    </TableCell>
                  </TableRow>
                ) : (
                  shelters.map((shelter) => (
                    <TableRow key={shelter.id}>
                      <TableCell className="font-medium">{shelter.full_name || '-'}</TableCell>
                      <TableCell>{shelter.email || '-'}</TableCell>
                      <TableCell>{shelter.phone || '-'}</TableCell>
                      <TableCell>{formatDate(shelter.created_at)}</TableCell>
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

export default AdminSheltersTab;
