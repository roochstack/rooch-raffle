import { useRaffles } from '@/hooks/use-raffles';
import { cn } from '@/lib/utils';
import { formatDate } from 'date-fns';
import { ArrowRightIcon, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Empty } from '../empty';
import { Button } from '../ui/button';
import StatusCellContent from '../activity/status-cell-content';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

const skeletonArray = Array.from({ length: 3 });

export function RaffleTable() {
  const t = useTranslations();
  const { data: raffles, isLoading } = useRaffles();
  const router = useRouter();

  console.log('raffles', raffles);

  if (!isLoading && !raffles?.length) {
    return (
      <div className="flex items-center justify-center pt-16">
        <Empty
          title={t('common.noData')}
          description={
            <Link
              href="/create?type=raffle"
              className="inline-block border-b border-transparent text-gray-400 transition-all"
            >
              {t('activities.list.raffle.table.createFirst')}
              <ArrowRightIcon className="ml-1 inline-block h-4 w-4" />
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
      {raffles?.map((raffle, index) => (
        <div
          key={raffle.id}
          className={cn(
            'flex cursor-pointer items-center justify-between px-3 py-4 transition-all hover:bg-muted/50',
            index !== 0 && 'border-t border-muted'
          )}
          onClick={() => {
            router.push(`/activities/raffle/manage/${raffle.id}`);
          }}
        >
          <div className="flex gap-4">
            <Image
              alt="raffle cover image"
              className="h-20 w-20 rounded-md object-cover"
              src={raffle.coverImageUrl}
              height="80"
              width="80"
            />

            <div>
              <div className="space-y-1.5">
                <div className="text-base/6 font-semibold">{raffle.name}</div>
                <p className="text-xs/6 text-gray-500">
                  {raffle.status === 'ongoing'
                    ? t('time.startAt', { time: formatDate(raffle.startTime, 'yyyy-MM-dd HH:mm') })
                    : raffle.status === 'not-started'
                      ? t('time.startAt', { time: formatDate(raffle.startTime, 'yyyy-MM-dd HH:mm') })
                      : raffle.status === 'ended'
                        ? t('time.endedAt', { time: formatDate(raffle.endTime, 'yyyy-MM-dd HH:mm') })
                        : ''}
                </p>
                <p className="text-xs/6 text-gray-600">
                  {t('activities.list.raffle.participantCount', { count: raffle.claimedAddressList.length })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusCellContent status={raffle.status} />
            <Button size="icon" variant="ghost">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
