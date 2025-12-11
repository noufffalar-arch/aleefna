import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
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
import { Users, Edit2, Check, X, Trash2, ShieldPlus, ShieldMinus } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];
type AppRole = Database['public']['Enums']['app_role'];

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  role: UserRole;
  created_at: string;
}

interface UserRoleEntry {
  user_id: string;
  role: AppRole;
}

interface AdminUsersTabProps {
  users: UserProfile[];
  userRoles: UserRoleEntry[];
  isRtl: boolean;
  onRefresh: () => void;
}

const AdminUsersTab = ({ users, userRoles, isRtl, onRefresh }: AdminUsersTabProps) => {
  const { t } = useTranslation();
  const [filterRole, setFilterRole] = useState<string>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole>('owner');

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter(user => user.role === filterRole);

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      owner: t('admin.roleOwner'),
      shelter: t('admin.roleShelter'),
      clinic: t('admin.roleClinic'),
      store: t('admin.roleStore'),
      government: t('admin.roleGovernment'),
      admin: t('admin.roleAdmin'),
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
      onRefresh();
    }
  };

  const isUserAdmin = (userId: string) => {
    return userRoles.some(ur => ur.user_id === userId && ur.role === 'admin');
  };

  const handleToggleAdmin = async (user: UserProfile) => {
    const hasAdminRole = isUserAdmin(user.user_id);
    
    if (hasAdminRole) {
      // Remove admin role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id)
        .eq('role', 'admin');
      
      if (error) {
        toast.error(t('common.error'));
      } else {
        toast.success(t('admin.adminRemoved'));
        onRefresh();
      }
    } else {
      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.user_id, role: 'admin' });
      
      if (error) {
        toast.error(t('common.error'));
      } else {
        toast.success(t('admin.adminAdded'));
        onRefresh();
      }
    }
  };

  const roles: UserRole[] = ['owner', 'shelter', 'clinic', 'store', 'government', 'admin'];

  return (
    <div className="space-y-6">
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
            <SelectItem value="admin">{t('admin.roleAdmin')}</SelectItem>
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
                  <TableHead>{t('admin.adminStatus')}</TableHead>
                  <TableHead>{t('admin.registrationDate')}</TableHead>
                  <TableHead>{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                      <TableCell>
                        {isUserAdmin(user.user_id) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {t('admin.isAdmin')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {editingUserId === user.id ? (
                            <>
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
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleEditRole(user)}
                                title={t('common.edit')}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className={`h-8 w-8 ${isUserAdmin(user.user_id) ? 'text-amber-600 hover:text-amber-700' : 'text-primary hover:text-primary/80'}`}
                                onClick={() => handleToggleAdmin(user)}
                                title={isUserAdmin(user.user_id) ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                              >
                                {isUserAdmin(user.user_id) ? <ShieldMinus className="h-4 w-4" /> : <ShieldPlus className="h-4 w-4" />}
                              </Button>
                            </>
                          )}
                        </div>
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
  );
};

export default AdminUsersTab;
