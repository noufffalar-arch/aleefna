import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { changeLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';
import { User, Mail, Globe, LogOut } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import i18n from '@/i18n';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="aleefna-gradient-bg px-6 pt-8 pb-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      </div>

      <div className="px-6 mt-6 space-y-4">
        <div className="aleefna-card flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{profile?.full_name}</h3>
            <p className="text-muted-foreground text-sm">{t(`userTypes.${profile?.role}`)}</p>
          </div>
        </div>

        <div className="aleefna-card flex items-center gap-4">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <span>{profile?.email}</span>
        </div>

        <div className="aleefna-card flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span>{t('profile.language')}</span>
          </div>
          <Button variant="outline" size="sm" onClick={toggleLanguage}>
            {i18n.language === 'ar' ? 'English' : 'العربية'}
          </Button>
        </div>

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          {t('auth.logout')}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
