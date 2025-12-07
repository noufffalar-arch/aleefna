import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Grid3X3, ShoppingBag, ClipboardList, User } from 'lucide-react';

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { key: 'home', icon: Home, path: '/dashboard' },
    { key: 'services', icon: Grid3X3, path: '/services' },
    { key: 'store', icon: ShoppingBag, path: '/store' },
    { key: 'history', icon: ClipboardList, path: '/history' },
    { key: 'profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{t(`nav.${item.key}`)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
