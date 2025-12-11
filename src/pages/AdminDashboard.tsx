import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useRTL } from '@/hooks/useRTL';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, ArrowRight, Users, Shield, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  role: UserRole;
  created_at: string;
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { isRtl } = useRTL();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole>('owner');

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
      setFilteredUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (filterRole === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.role === filterRole));
    }
  }, [filterRole, users]);

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      owner: t('admin.roleOwner'),
      shelter: t('admin.roleShelter'),
      clinic: t('admin.roleClinic'),
      store: t('admin.roleStore'),
      government: t('admin.roleGovernment'),
    };
    return roleLabels[role] || role;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEditRole = (user: UserProfile) => {
    setEditingUserId(user.id);
    setEditingRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingRole('owner');
  };

  const handleSaveRole = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: editingRole })
      .eq('id', userId);

    if (error) {
      console.error('Error updating role:', error);
      toast.error(t('common.error'));
    } else {
      toast.success(t('admin.roleUpdated'));
      setEditingUserId(null);
      fetchUsers();
    }
  };

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
  const roles: UserRole[] = ['owner', 'shelter', 'clinic', 'store', 'government'];

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

      <div className="p-4 space-y-6">
        {/* Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              {t('admin.totalUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{users.length}</p>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{t('admin.filterByRole')}:</span>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.allRoles')}</SelectItem>
              <SelectItem value="owner">{t('admin.roleOwner')}</SelectItem>
              <SelectItem value="shelter">{t('admin.roleShelter')}</SelectItem>
              <SelectItem value="clinic">{t('admin.roleClinic')}</SelectItem>
              <SelectItem value="store">{t('admin.roleStore')}</SelectItem>
              <SelectItem value="government">{t('admin.roleGovernment')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.usersList')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.name')}</TableHead>
                    <TableHead>{t('admin.email')}</TableHead>
                    <TableHead>{t('admin.userType')}</TableHead>
                    <TableHead>{t('admin.registrationDate')}</TableHead>
                    <TableHead>{t('admin.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {t('admin.noUsers')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Select value={editingRole} onValueChange={(value) => setEditingRole(value as UserRole)}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {getRoleLabel(role)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {getRoleLabel(user.role)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleSaveRole(user.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleEditRole(user)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
