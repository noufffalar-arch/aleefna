import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Scissors, Heart, Droplets, Sparkles } from 'lucide-react';

const Care = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tips = [
    { icon: Droplets, title: 'الاستحمام المنتظم', description: 'حمّم حيوانك الأليف مرة كل 2-4 أسابيع حسب نوعه' },
    { icon: Scissors, title: 'قص الأظافر', description: 'قص أظافر حيوانك كل 2-3 أسابيع لتجنب الإصابات' },
    { icon: Sparkles, title: 'تنظيف الفراء', description: 'مشط فراء حيوانك يومياً للحفاظ على نظافته' },
    { icon: Heart, title: 'الفحص الدوري', description: 'زيارة الطبيب البيطري كل 6 أشهر للفحص الشامل' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <div></div>
        <h1 className="text-xl font-bold text-foreground">{t('care.title')}</h1>
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6">
        <h2 className="font-bold text-lg mb-4 text-end text-foreground">{t('care.tips')}</h2>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="aleefna-card flex items-start gap-4">
              <div className="flex-1 text-end">
                <h3 className="font-semibold text-foreground mb-1">{tip.title}</h3>
                <p className="text-muted-foreground text-sm">{tip.description}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <tip.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Care;
