import { useTranslations } from 'next-intl';

export default function PreviewBanner() {
  const t = useTranslations('activities.preview');

  return (
    <div className="fixed left-0 right-0 top-14 z-50 flex h-9 items-center justify-center bg-yellow-100 text-center text-sm text-yellow-800">
      <p>{t('banner')}</p>
    </div>
  );
}
