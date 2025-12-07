import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Calendar, Scissors, AlertTriangle, Stethoscope, ShoppingCart, Building2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const Services = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const services = [
    { key: 'reportMissing', icon: Search, bgColor: 'bg-aleefna-orange-light', iconColor: 'text-aleefna-orange', path: '/missing-report' },
    { key: 'adoption', icon: Heart, bgColor: 'bg-aleefna-purple-light', iconColor: 'text-aleefna-purple', path: '/adoption' },
    { key: 'bookAppointment', icon: Calendar, bgColor: 'bg-aleefna-blue-light', iconColor: 'text-aleefna-blue', path: '/book-appointment' },
    { key: 'care', icon: Scissors, bgColor: 'bg-secondary', iconColor: 'text-primary', path: '/care' },
    { key: 'strayReport', icon: AlertTriangle, bgColor: 'bg-aleefna-red-light', iconColor: 'text-aleefna-red', path: '/stray-report' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-xl font-bold text-end text-foreground">{t('nav.services')}</h1>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => (
            <button 
              key={service.key} 
              onClick={() => navigate(service.path)} 
              className="aleefna-card-hover flex flex-col items-center gap-3 py-6"
            >
              <div className={`service-icon ${service.bgColor}`}>
                <service.icon className={`w-7 h-7 ${service.iconColor}`} />
              </div>
              <span className="text-sm font-medium text-foreground">{t(`services.${service.key}`)}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Services;
