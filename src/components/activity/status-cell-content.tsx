import { useTranslations } from 'next-intl';
import { ActivityStatus } from '@/interfaces';

export default function StatusCellContent({ status }: { status: ActivityStatus }) {
  const t = useTranslations('status');

  if (status === 'not-started') {
    return (
      <div className="inline-flex items-center gap-x-1.5 rounded-md bg-yellow-600/10 px-1.5 py-0.5 text-sm/5 font-medium text-yellow-700 group-data-[hover]:bg-yellow-600/20 sm:text-xs/5 forced-colors:outline">
        <span>{t('upcoming')}</span>
      </div>
    );
  }

  if (status === 'ongoing') {
    return (
      <div className="inline-flex items-center gap-x-1.5 rounded-md bg-rose-400/10 px-1.5 py-0.5 text-sm/5 font-medium text-rose-700 group-data-[hover]:bg-rose-400/20 sm:text-xs/5 forced-colors:outline">
        <span>{t('ongoing')}</span>
      </div>
    );
  }

  if (status === 'all-claimed') {
    return (
      <div className="inline-flex items-center gap-x-1.5 rounded-md bg-green-400/10 px-1.5 py-0.5 text-sm/5 font-medium text-green-700 group-data-[hover]:bg-green-400/20 sm:text-xs/5 forced-colors:outline">
        <span>{t('all-claimed')}</span>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="inline-flex items-center gap-x-1.5 rounded-md bg-gray-600/10 px-1.5 py-0.5 text-sm/5 font-medium text-gray-700 group-data-[hover]:bg-gray-400/20 sm:text-xs/5 forced-colors:outline">
        <span>{t('ended')}</span>
      </div>
    );
  }

  return <span>{status}</span>;
}
