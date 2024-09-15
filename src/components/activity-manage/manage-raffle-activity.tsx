'use client';

import { formatDate } from 'date-fns';
import { ArrowUpRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useOpenBox, useRaffleDetail } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime } from '@/utils/kit';
import StatusCellContent from '../activity/status-cell-content';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface ManageActivityProps {
  id: string;
}

export function ManageRaffleActivity({ id }: ManageActivityProps) {
  const raffleDetailQueryResult = useRaffleDetail(id);
  const openBox = useOpenBox();
  const { toast } = useToast();

  const ableToOpen =
    raffleDetailQueryResult.data?.status === 'ended' &&
    raffleDetailQueryResult.data?.opened === false;

  if (raffleDetailQueryResult.isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative pt-14">
      <style jsx global>
        {`
          body {
            background-color: hsl(var(--muted) / 0.4);
          }
        `}
      </style>
      <div className="fixed left-0 top-0 z-[-1] h-44 w-full bg-gradient-to-b from-[#f0f4fa] to-muted/0"></div>
      <div className="mx-auto max-w-5xl space-y-6 p-6 pt-11">
        <div className="flex w-full items-center gap-x-6">
          <Image
            alt="raffle cover image"
            className="h-20 w-20 cursor-pointer rounded-md object-cover"
            height="64"
            src={raffleDetailQueryResult.data!.coverImageUrl}
            width="64"
          />
          <div className="w-full">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-x-2">
                <h1 className="text-3xl/8 font-bold">{raffleDetailQueryResult.data!.name}</h1>
                <StatusCellContent status={raffleDetailQueryResult.data!.status} />
              </div>
              <Link
                href={`/activities/raffle/${id}`}
                className="inline-flex cursor-pointer items-center justify-center rounded-md border-b border-transparent bg-gray-200/60 px-2.5 py-2 text-sm font-semibold leading-none text-gray-600 transition-all hover:bg-gray-600 hover:text-white"
              >
                <span>Activity Page</span> <ArrowUpRightIcon className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-2 text-sm/6 text-gray-500">
              Created at {formatRelativeTime(raffleDetailQueryResult.data!.createdAt, 'hours')}
            </div>
          </div>
        </div>
        <Separator />

        {ableToOpen && (
          <div>
            <div className="text-base/7 font-semibold text-gray-950 dark:text-white">
              活动已结束，尚未开奖
            </div>
            <Button
              onClick={async () => {
                try {
                  await openBox(id);
                  toast({
                    title: '✅ 开奖成功',
                  });
                  raffleDetailQueryResult.refetch();
                } catch (error) {
                  console.error(error);

                  if (error instanceof Error) {
                    toast({
                      title: '❌ Failed to open box',
                      description: error.message,
                    });
                  }
                }
              }}
            >
              开奖
            </Button>
          </div>
        )}

        {raffleDetailQueryResult.data!.opened && (
          <div className="text-base/7 font-semibold text-gray-950 dark:text-white">活动已结束</div>
        )}

        <div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-base/7 font-semibold text-gray-950 dark:text-white sm:text-sm/6">
              Details
            </div>
            <hr className="mt-4 w-full border-t border-gray-950/10 dark:border-white/10" />
            <dl className="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6">
              <dt className="col-start-1 border-t border-gray-950/5 pt-3 text-gray-500 first:border-none dark:border-white/5 dark:text-gray-400 sm:py-3 sm:dark:border-white/5">
                Description
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-gray-950 dark:text-white sm:py-3 dark:sm:border-white/5">
                {raffleDetailQueryResult.data!.description}
              </dd>
              <dt className="col-start-1 border-t border-gray-950/5 pt-3 text-gray-500 first:border-none dark:border-white/5 dark:text-gray-400 sm:border-t sm:border-gray-950/5 sm:py-3 sm:dark:border-white/5">
                Reward amount
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-gray-950 dark:text-white sm:border-t sm:border-gray-950/5 sm:py-3 dark:sm:border-white/5">
                {raffleDetailQueryResult.data!.rewardAmount}
              </dd>
              <dt className="col-start-1 border-t border-gray-950/5 pt-3 text-gray-500 first:border-none dark:border-white/5 dark:text-gray-400 sm:py-3 sm:dark:border-white/5">
                Created at
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-gray-950 dark:text-white sm:border-t sm:border-gray-950/5 sm:py-3 dark:sm:border-white/5">
                {formatDate(raffleDetailQueryResult.data!.createdAt, 'yyyy-MM-dd HH:mm:ss')}
              </dd>
              <dt className="col-start-1 border-t border-gray-950/5 pt-3 text-gray-500 first:border-none dark:border-white/5 dark:text-gray-400 sm:border-t sm:border-gray-950/5 sm:py-3 sm:dark:border-white/5">
                Start time
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-gray-950 dark:text-white sm:border-t sm:border-gray-950/5 sm:py-3 dark:sm:border-white/5">
                {formatDate(raffleDetailQueryResult.data!.startTime, 'yyyy-MM-dd HH:mm:ss')}
              </dd>
              <dt className="col-start-1 border-t border-gray-950/5 pt-3 text-gray-500 first:border-none dark:border-white/5 dark:text-gray-400 sm:border-t sm:border-gray-950/5 sm:py-3 sm:dark:border-white/5">
                End time
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-gray-950 dark:text-white sm:border-t sm:border-gray-950/5 sm:py-3 dark:sm:border-white/5">
                {formatDate(raffleDetailQueryResult.data!.endTime, 'yyyy-MM-dd HH:mm:ss')}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
