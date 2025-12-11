import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const useRTL = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [dir, i18n.language]);

  return { isRtl, dir };
};

export default useRTL;
