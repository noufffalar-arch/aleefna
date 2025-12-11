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
import { Stethoscope, MapPin, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Clinic {
  id: string;
  name: string;
  city: string;
  area: string | null;
  address: string | null;
  phone: string | null;
  doctor_name: string | null;
  logo_url: string | null;
  services: string[] | null;
  created_at: string;
}

interface AdminClinicsTabProps {
  isRtl: boolean;
}

const AdminClinicsTab = ({ isRtl }: AdminClinicsTabProps) => {
  const { t } = useTranslation();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClinics(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
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
            <Stethoscope className="h-5 w-5 text-primary" />
            {t('admin.totalClinics', 'إجمالي العيادات')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{clinics.length}</p>
        </CardContent>
      </Card>

      {/* Clinics Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.clinicsList', 'قائمة العيادات')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.clinic', 'العيادة')}</TableHead>
                  <TableHead>{t('admin.doctorName', 'اسم الطبيب')}</TableHead>
                  <TableHead>{t('admin.location', 'الموقع')}</TableHead>
                  <TableHead>{t('admin.phone', 'الهاتف')}</TableHead>
                  <TableHead>{t('admin.services', 'الخدمات')}</TableHead>
                  <TableHead>{t('admin.registrationDate', 'تاريخ التسجيل')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('admin.noClinics', 'لا توجد عيادات مسجلة')}
                    </TableCell>
                  </TableRow>
                ) : (
                  clinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={clinic.logo_url || undefined} alt={clinic.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              <Stethoscope className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{clinic.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{clinic.doctor_name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{clinic.city}{clinic.area ? ` - ${clinic.area}` : ''}</span>
                        </div>
                        {clinic.address && (
                          <p className="text-xs text-muted-foreground mt-1">{clinic.address}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {clinic.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span dir="ltr">{clinic.phone}</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {clinic.services && clinic.services.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {clinic.services.slice(0, 3).map((service, idx) => (
                              <span 
                                key={idx} 
                                className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {service}
                              </span>
                            ))}
                            {clinic.services.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{clinic.services.length - 3}
                              </span>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{formatDate(clinic.created_at)}</TableCell>
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

export default AdminClinicsTab;
