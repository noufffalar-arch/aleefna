import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Grid3X3, ShoppingBag, Heart, User } from 'lucide-react';

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { key: 'profile', icon: User, path: '/profile' },
    { key: 'history', icon: Heart, path: '/history' },
    { key: 'store', icon: ShoppingBag, path: '/store' },
    { key: 'services', icon: Grid3X3, path: '/services' },
    { key: 'home', icon: Home, path: '/dashboard' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border px-2 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/');
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{t(`nav.${item.key}`)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
