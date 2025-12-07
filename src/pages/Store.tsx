import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const Store = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-xl font-bold text-end text-foreground">{t('store.title')}</h1>
      </div>

      <div className="px-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <p className="text-muted-foreground text-center">{t('store.comingSoon')}</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Store;
