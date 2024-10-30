import { useEnvelopeClaimedInfo } from '@/hooks';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ClaimedCountProps {
  tableHandleId: string;
  className?: string;
}

export function CoinClaimedCount({ tableHandleId, className }: ClaimedCountProps) {
  const { data, isLoading } = useEnvelopeClaimedInfo(tableHandleId);
  const t = useTranslations('activities.envelope.participantList');

  if (isLoading) {
    return <Skeleton className={cn('inline-block h-2 w-[30px]', className)} />;
  }

  return <p className={className}>{t('count', { count: data.length })}</p>;
}
