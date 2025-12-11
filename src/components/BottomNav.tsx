import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Grid3X3, ShoppingBag, Heart, User, LogIn } from 'lucide-react';
import useRTL from '@/hooks/useRTL';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isRtl } = useRTL();
  const { isGuest, exitGuestMode } = useAuth();

  const handleNavClick = (path: string, requiresAuth: boolean) => {
    if (isGuest && requiresAuth) {
      if (path === '/profile') {
        exitGuestMode();
        navigate('/auth');
      } else {
        toast.info(t('guest.requireAuth'));
      }
      return;
    }
    navigate(path);
  };

  const navItems = [
    { key: 'home', icon: Home, path: '/dashboard', requiresAuth: false },
    { key: 'services', icon: Grid3X3, path: '/services', requiresAuth: false },
    { key: 'store', icon: ShoppingBag, path: '/store', requiresAuth: false },
    { key: 'history', icon: Heart, path: '/history', requiresAuth: true },
    { key: 'profile', icon: isGuest ? LogIn : User, path: '/profile', requiresAuth: true },
  ];

  // Reverse order for RTL
  const orderedItems = isRtl ? [...navItems].reverse() : navItems;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border px-2 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {orderedItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/');
          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.path, item.requiresAuth)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">
                {isGuest && item.key === 'profile' ? t('auth.login') : t(`nav.${item.key}`)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
