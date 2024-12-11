import { cn } from '@/lib/utils';
import { ArrowUpRightIcon, CircleCheck, TwitterIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TwitterBindingStatusProps {
  creatorAddress: string;
  binded: boolean;
  className?: string;
}

export default function TwitterBindingStatus({
  creatorAddress,
  binded,
  className,
}: TwitterBindingStatusProps) {
  const t = useTranslations('activities.envelope');
  if (binded) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <CircleCheck strokeWidth={2.25} className="w-3 h-3 text-green-500" />
        <div className="text-xs text-gray-500">{t('twitterBindedTip1')}</div>
      </div>
    );
  }
  return (
    <a href={`https://portal.rooch.network/inviter/${creatorAddress}`} target="_blank" className={cn('inline-flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors hover:underline underline-offset-2 cursor-pointer', className)}>
      <TwitterIcon className="w-3 h-3 mr-1" />
      <div>{t('twitterBindingTip1')}</div>
      <ArrowUpRightIcon className="w-3 h-3" />
    </a>
  );
}

