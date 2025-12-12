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
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface StrayReport {
  id: string;
  animal_type: string;
  danger_level: string;
  location_text: string;
  description: string | null;
  status: string | null;
  created_at: string;
  user_id: string;
}

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string | null;
}

interface AdminStrayReportsTabProps {
  isRtl: boolean;
}

const AdminStrayReportsTab = ({ isRtl }: AdminStrayReportsTabProps) => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<StrayReport[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [reportsResponse, usersResponse] = await Promise.all([
        supabase.from('stray_reports').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('user_id, full_name, email')
      ]);

      if (!reportsResponse.error) {
        setReports(reportsResponse.data || []);
      }
      if (!usersResponse.error) {
        setUsers(usersResponse.data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const getReporterName = (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    return user?.full_name || user?.email || '-';
  };

  const getDangerLabel = (level: string) => {
    const labels: Record<string, string> = {
      low: t('stray.low'),
      medium: t('stray.medium'),
      high: t('stray.high'),
    };
    return labels[level] || level;
  };

  const getDangerColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return '-';
    const labels: Record<string, string> = {
      new: t('status.new'),
      inProgress: t('status.inProgress'),
      closed: t('status.closed'),
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('stray_reports').delete().eq('id', id);
    if (error) {
      toast.error('حدث خطأ أثناء الحذف');
    } else {
      toast.success('تم حذف البلاغ بنجاح');
      setReports(prev => prev.filter(r => r.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-primary" />
            {t('admin.totalStrayReports')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{reports.length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.strayReportsList')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('stray.animalType')}</TableHead>
                  <TableHead>{t('stray.dangerLevel')}</TableHead>
                  <TableHead>{t('stray.location')}</TableHead>
                  <TableHead>{t('admin.reporter')}</TableHead>
                  <TableHead>{t('admin.status')}</TableHead>
                  <TableHead>{t('admin.registrationDate')}</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('admin.noStrayReports')}
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.animal_type}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDangerColor(report.danger_level)}`}>
                          {getDangerLabel(report.danger_level)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{report.location_text}</TableCell>
                      <TableCell>{getReporterName(report.user_id)}</TableCell>
                      <TableCell>{getStatusLabel(report.status)}</TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>هل أنت متأكد من حذف هذا البلاغ؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(report.id)} className="bg-destructive text-destructive-foreground">
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

export default AdminStrayReportsTab;
