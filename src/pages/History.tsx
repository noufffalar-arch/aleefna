import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Search, AlertTriangle, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';

interface Appointment {
  id: string;
  service_type: string;
  appointment_date: string;
  status: string;
}

interface MissingReport {
  id: string;
  last_seen_location: string;
  status: string;
  created_at: string;
}

interface StrayReport {
  id: string;
  animal_type: string;
  location_text: string;
  status: string;
  created_at: string;
}

const History = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [missingReports, setMissingReports] = useState<MissingReport[]>([]);
  const [strayReports, setStrayReports] = useState<StrayReport[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [apptRes, missingRes, strayRes] = await Promise.all([
      supabase.from('appointments').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('missing_reports').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('stray_reports').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    ]);

    if (apptRes.data) setAppointments(apptRes.data);
    if (missingRes.data) setMissingReports(missingRes.data);
    if (strayRes.data) setStrayReports(strayRes.data);
  };

  const handleDeleteMissingReport = async (id: string) => {
    const { error } = await supabase.from('missing_reports').delete().eq('id', id);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.deleted'));
      setMissingReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDeleteStrayReport = async (id: string) => {
    const { error } = await supabase.from('stray_reports').delete().eq('id', id);
    if (error) {
      toast.error(t('common.error'));
    } else {
      toast.success(t('common.deleted'));
      setStrayReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-aleefna-orange-light text-aleefna-orange',
      active: 'bg-aleefna-blue-light text-aleefna-blue',
      completed: 'bg-secondary text-primary',
      new: 'bg-aleefna-purple-light text-aleefna-purple',
    };
    return statusColors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-xl font-bold text-end text-foreground">{t('history.title')}</h1>
      </div>

      <div className="px-6">
        <Tabs defaultValue="appointments" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="appointments" className="text-xs">{t('history.appointments')}</TabsTrigger>
            <TabsTrigger value="missing" className="text-xs">{t('history.missingReports')}</TabsTrigger>
            <TabsTrigger value="stray" className="text-xs">{t('history.strayReports')}</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-3">
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{t('history.noHistory')}</div>
            ) : (
              appointments.map((appt) => (
                <div key={appt.id} className="aleefna-card flex items-center gap-4">
                  <div className="flex-1 text-end">
                    <p className="font-medium text-foreground">{appt.service_type}</p>
                    <p className="text-sm text-muted-foreground">{new Date(appt.appointment_date).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs ${getStatusBadge(appt.status)}`}>
                    {t(`status.${appt.status}`)}
                  </span>
                  <Calendar className="w-5 h-5 text-aleefna-blue" />
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="missing" className="space-y-3">
            {missingReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{t('history.noHistory')}</div>
            ) : (
              missingReports.map((report) => (
                <div key={report.id} className="aleefna-card flex items-center gap-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('common.deleteWarning')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteMissingReport(report.id)} className="bg-destructive text-destructive-foreground">
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <div className="flex-1 text-end">
                    <p className="font-medium text-foreground">{report.last_seen_location}</p>
                    <p className="text-sm text-muted-foreground">{new Date(report.created_at).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs ${getStatusBadge(report.status)}`}>
                    {t(`status.${report.status}`)}
                  </span>
                  <Search className="w-5 h-5 text-aleefna-orange" />
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="stray" className="space-y-3">
            {strayReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{t('history.noHistory')}</div>
            ) : (
              strayReports.map((report) => (
                <div key={report.id} className="aleefna-card flex items-center gap-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('common.deleteWarning')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteStrayReport(report.id)} className="bg-destructive text-destructive-foreground">
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <div className="flex-1 text-end">
                    <p className="font-medium text-foreground">{report.animal_type} - {report.location_text}</p>
                    <p className="text-sm text-muted-foreground">{new Date(report.created_at).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs ${getStatusBadge(report.status)}`}>
                    {t(`status.${report.status}`)}
                  </span>
                  <AlertTriangle className="w-5 h-5 text-aleefna-red" />
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default History;
