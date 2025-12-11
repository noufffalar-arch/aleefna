import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useRTL } from '@/hooks/useRTL';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Shield, Users, PawPrint, Building2 } from 'lucide-react';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminPetsTab from '@/components/admin/AdminPetsTab';
import AdminSheltersTab from '@/components/admin/AdminSheltersTab';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];
type AppRole = Database['public']['Enums']['app_role'];

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

interface UserRoleEntry {
  user_id: string;
  role: AppRole;
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { isRtl } = useRTL();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  const fetchData = async () => {
    if (!isAdmin) return;
    
    const [usersResponse, rolesResponse] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('user_roles')
        .select('user_id, role')
    ]);

    if (!usersResponse.error) {
      setUsers(usersResponse.data || []);
    }
    if (!rolesResponse.error) {
      setUserRoles(rolesResponse.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-primary-foreground hover:bg-primary/80"
          >
            <BackArrow className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-bold">{t('admin.title')}</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('admin.usersTab')}</span>
            </TabsTrigger>
            <TabsTrigger value="pets" className="flex items-center gap-2">
              <PawPrint className="h-4 w-4" />
              <span className="hidden sm:inline">{t('admin.petsTab')}</span>
            </TabsTrigger>
            <TabsTrigger value="shelters" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('admin.sheltersTab')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUsersTab 
              users={users} 
              userRoles={userRoles}
              isRtl={isRtl} 
              onRefresh={fetchData} 
            />
          </TabsContent>

          <TabsContent value="pets">
            <AdminPetsTab isRtl={isRtl} />
          </TabsContent>

          <TabsContent value="shelters">
            <AdminSheltersTab users={users} isRtl={isRtl} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
