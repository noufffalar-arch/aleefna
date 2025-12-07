import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PawPrint } from 'lucide-react';

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center aleefna-gradient-bg">
      <div className="animate-bounce-soft">
        <div className="w-28 h-28 bg-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6">
          <PawPrint className="w-16 h-16 text-primary-foreground" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-primary animate-fade-in mb-3">
        {t('app.name')}
      </h1>
      <p className="text-muted-foreground text-center px-8 animate-slide-up">
        {t('app.tagline')}
      </p>
    </div>
  );
};

export default Splash;
