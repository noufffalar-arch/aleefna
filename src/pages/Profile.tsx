import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { changeLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';
import { User, Mail, Globe, LogOut, ChevronLeft } from 'lucide-react';
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
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-xl font-bold text-end text-foreground">{t('profile.title')}</h1>
      </div>

      <div className="px-6 space-y-4">
        {/* User Info Card */}
        <div className="aleefna-card flex items-center gap-4">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          <div className="flex-1 text-end">
            <h3 className="font-bold text-lg text-foreground">{profile?.full_name}</h3>
            <p className="text-muted-foreground text-sm">{t(`userTypes.${profile?.role}`)}</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Email */}
        <div className="aleefna-card flex items-center gap-4">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          <span className="flex-1 text-end text-foreground" dir="ltr">{profile?.email}</span>
          <Mail className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Language Toggle */}
        <div className="aleefna-card flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={toggleLanguage} className="text-primary border-primary">
            {i18n.language === 'ar' ? 'English' : 'العربية'}
          </Button>
          <span className="flex-1 text-end text-foreground">{t('profile.language')}</span>
          <Globe className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Logout */}
        <Button variant="destructive" className="w-full mt-8" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          {t('auth.logout')}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
