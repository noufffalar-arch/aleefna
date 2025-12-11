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
import { Landmark } from 'lucide-react';
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

interface AdminGovernmentTabProps {
  users: UserProfile[];
  isRtl: boolean;
}

const AdminGovernmentTab = ({ users, isRtl }: AdminGovernmentTabProps) => {
  const { t } = useTranslation();

  const governmentEntities = users.filter(user => user.role === 'government');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Landmark className="h-5 w-5 text-primary" />
            {t('admin.totalGovernment')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{governmentEntities.length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.governmentList')}</CardTitle>
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
                {governmentEntities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {t('admin.noGovernment')}
                    </TableCell>
                  </TableRow>
                ) : (
                  governmentEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.full_name || '-'}</TableCell>
                      <TableCell>{entity.email || '-'}</TableCell>
                      <TableCell>{entity.phone || '-'}</TableCell>
                      <TableCell>{formatDate(entity.created_at)}</TableCell>
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

export default AdminGovernmentTab;
