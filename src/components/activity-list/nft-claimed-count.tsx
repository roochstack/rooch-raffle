import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ClaimedCountProps {
  count: number;
  className?: string;
  isLoading?: boolean;
}

export function NFTClaimedCount({ count, isLoading, className }: ClaimedCountProps) {
  const t = useTranslations();

  if (isLoading) {
    return <Skeleton className={cn('inline-block h-2 w-[30px]', className)} />;
  }

  return <p className={className}>{t('activities.raffle.participants.count', { count })}</p>;
}
