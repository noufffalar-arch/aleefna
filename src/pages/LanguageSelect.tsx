import { useNavigate } from 'react-router-dom';
import { PawPrint, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { changeLanguage } from '@/i18n';

const LanguageSelect = () => {
  const navigate = useNavigate();

  const selectLanguage = (lang: 'ar' | 'en') => {
    changeLanguage(lang);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center splash-bg px-6" dir="ltr">
      {/* Logo */}
      <div className="animate-bounce-soft mb-8">
        <div className="paw-logo-large">
          <PawPrint className="w-16 h-16 text-primary" strokeWidth={2.5} />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold text-primary mb-2 animate-fade-in">أليفنا</h1>
      <h2 className="text-2xl font-semibold text-primary/80 mb-8 animate-fade-in">Aleefna</h2>
      
      {/* Language Selection */}
      <div className="w-full max-w-xs space-y-4 animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-primary" />
          <span className="text-primary font-medium">اختر اللغة / Choose Language</span>
        </div>
        
        <Button 
          onClick={() => selectLanguage('ar')}
          className="w-full h-14 text-lg font-bold"
          variant="default"
        >
          العربية
        </Button>
        
        <Button 
          onClick={() => selectLanguage('en')}
          className="w-full h-14 text-lg font-bold"
          variant="outline"
        >
          English
        </Button>
      </div>
      
      <p className="text-primary/60 text-sm mt-8 animate-fade-in text-center">
        منصة ذكية لرعاية وتتبع الحيوانات الأليفة
        <br />
        Smart platform for pet care and tracking
      </p>
    </div>
  );
};

export default LanguageSelect;
