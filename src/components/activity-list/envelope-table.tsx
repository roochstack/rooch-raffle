import { useTranslations } from 'next-intl';
import { useEnvelopes } from '@/hooks';
import { cn } from '@/lib/utils';
import { ArrowUpRightIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Empty } from '../empty';
import { Skeleton } from '@/components/ui/skeleton';
import { EnvelopeCard } from '@/components/activity-list/envelope-card';

const skeletonArray = Array.from({ length: 3 });

export function EnvelopeTable() {
  const t = useTranslations('activities.create');
  const { data: envelopes, isLoading } = useEnvelopes();

  if (!isLoading && !envelopes?.length) {
    return (
      <div className="flex items-center justify-center pt-16">
        <Empty
          title={t('noData')}
          description={
            <Link
              href="/create?type=envelope"
              className="inline-flex items-center border-b border-transparent text-gray-400 transition-all hover:border-gray-500 hover:text-gray-500"
            >
              {t('firstActivity')}
              <ArrowUpRightIcon className="ml-1 inline-block h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white shadow-sm">
        {skeletonArray.map((_, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center justify-between px-3 py-4 transition-all',
              index !== 0 && 'border-t border-muted'
            )}
          >
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-md" />

              <div>
                <div className="flex h-full flex-col justify-between">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-3 w-[60px]" />
                  <Skeleton className="h-2 w-[40px]" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow-sm">
      {envelopes?.map((envelope, index) => (
        <EnvelopeCard
          key={envelope.id}
          className={index !== 0 ? 'border-t border-muted' : ''}
          envelope={envelope}
        />
      ))}
    </div>
  );
}
