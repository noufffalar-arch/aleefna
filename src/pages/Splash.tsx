import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PawPrint } from 'lucide-react';

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/language');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center splash-bg">
      <div className="animate-bounce-soft">
        <div className="paw-logo-large">
          <PawPrint className="w-16 h-16 text-primary" strokeWidth={2.5} />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-primary mt-8 animate-fade-in">
        {t('app.name')}
      </h1>
      <p className="text-primary/80 text-center px-8 mt-3 animate-slide-up text-sm">
        {t('app.tagline')}
      </p>
    </div>
  );
};

export default Splash;
