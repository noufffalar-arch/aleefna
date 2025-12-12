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
import { Search, Phone, MapPin, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface MissingReport {
  id: string;
  pet_id: string;
  last_seen_location: string;
  last_seen_date: string;
  description: string | null;
  status: string | null;
  contact_phone: string;
  created_at: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  pets?: {
    name: string;
    species: string;
    breed: string | null;
    photo_url: string | null;
  };
}

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string | null;
}

interface AdminMissingReportsTabProps {
  isRtl: boolean;
}

const AdminMissingReportsTab = ({ isRtl }: AdminMissingReportsTabProps) => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<MissingReport[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [reportsResponse, usersResponse] = await Promise.all([
        supabase
          .from('missing_reports')
          .select('*, pets(name, species, breed, photo_url)')
          .order('created_at', { ascending: false }),
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

  const getStatusLabel = (status: string | null) => {
    if (!status) return '-';
    const labels: Record<string, string> = {
      active: 'نشط',
      found: 'تم العثور عليه',
      closed: 'مغلق',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string | null) => {
    const colors: Record<string, string> = {
      active: 'bg-yellow-100 text-yellow-800',
      found: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status || ''] || 'bg-gray-100 text-gray-800';
  };

  const getSpeciesLabel = (species: string) => {
    const labels: Record<string, string> = {
      cat: 'قطة',
      dog: 'كلب',
      bird: 'طائر',
      other: 'أخرى',
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

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('missing_reports').delete().eq('id', id);
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

  const activeReports = reports.filter(r => r.status === 'active').length;
  const foundReports = reports.filter(r => r.status === 'found').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              إجمالي البلاغات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{reports.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-yellow-600">بلاغات نشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{activeReports}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-600">تم العثور عليها</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{foundReports}</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة بلاغات الحيوانات المفقودة</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الحيوان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>آخر مشاهدة</TableHead>
                  <TableHead>المُبلِّغ</TableHead>
                  <TableHead>رقم التواصل</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد بلاغات حيوانات مفقودة
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={report.pets?.photo_url || undefined} alt={report.pets?.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              🐾
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{report.pets?.name || '-'}</p>
                            {report.pets?.breed && (
                              <p className="text-xs text-muted-foreground">{report.pets.breed}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{report.pets ? getSpeciesLabel(report.pets.species) : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="max-w-[150px] truncate">{report.last_seen_location}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(report.last_seen_date)}
                        </p>
                      </TableCell>
                      <TableCell>{getReporterName(report.user_id)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span dir="ltr">{report.contact_phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </TableCell>
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

export default AdminMissingReportsTab;
