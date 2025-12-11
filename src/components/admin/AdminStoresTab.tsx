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
import { Store } from 'lucide-react';
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

interface AdminStoresTabProps {
  users: UserProfile[];
  isRtl: boolean;
}

const AdminStoresTab = ({ users, isRtl }: AdminStoresTabProps) => {
  const { t } = useTranslation();

  const stores = users.filter(user => user.role === 'store');

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
            <Store className="h-5 w-5 text-primary" />
            {t('admin.totalStores')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{stores.length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.storesList')}</CardTitle>
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
                {stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {t('admin.noStores')}
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{store.full_name || '-'}</TableCell>
                      <TableCell>{store.email || '-'}</TableCell>
                      <TableCell>{store.phone || '-'}</TableCell>
                      <TableCell>{formatDate(store.created_at)}</TableCell>
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

export default AdminStoresTab;
