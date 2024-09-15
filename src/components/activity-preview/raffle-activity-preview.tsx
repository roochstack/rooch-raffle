'use client';

import RaffleRecipientList from '@/components/activity/raffle-recipient-list';
import RaffleStatusButton from '@/components/activity/raffle-status-button';
import StatusBadge from '@/components/activity/status-badge';
import { Separator } from '@/components/ui/separator';
import { ClaimedItem } from '@/interfaces';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { formatDate } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

const emptyClaimed: Omit<ClaimedItem, 'amount' | 'claimedAt'>[] = [];

function RaffleActivityPreviewPage() {
  const searchParams = useSearchParams();
  const coverImageUrl = searchParams.get('coverImageUrl');
  const activityName = searchParams.get('activityName');
  const description = searchParams.get('description');
  const status = 'not-started';
  const startTimeTimestamp = searchParams.get('startTimeTimestamp');
  const endTimeTimestamp = searchParams.get('endTimeTimestamp');
  const startTime = startTimeTimestamp ? new Date(parseInt(startTimeTimestamp, 10)) : undefined;
  const endTime = endTimeTimestamp ? new Date(parseInt(endTimeTimestamp, 10)) : undefined;

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isDescExpandable, setIsDescExpandable] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (descRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(descRef.current).lineHeight);
      const height = descRef.current.clientHeight;
      setIsDescExpandable(height > lineHeight * 3);
    }
  }, [description]);

  const toggleDescExpand = useCallback(() => {
    setIsDescExpanded(!isDescExpanded);
  }, [isDescExpanded]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <div
        className="fixed left-0 top-0 h-full w-full bg-cover bg-center opacity-15 blur-[80px] brightness-125 saturate-200"
        style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : {}}
      />

      <div className="container mt-16 flex max-w-5xl flex-col gap-14 px-6 md:mt-[-100px] md:flex-row xl:gap-20">
        <img
          src={coverImageUrl || '/placeholder.svg'}
          alt="preview-activity"
          className="pointer-events-none z-[-1] h-auto w-full rounded-lg object-cover shadow-xl drop-shadow-lg md:w-1/2 md:max-w-[488px]"
        />

        <div className="relative mt-8 w-full lg:mt-0">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="text-5xl font-bold text-gray-900">{activityName || '[活动名称]'}</h1>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <StatusBadge status={status} />
                  <span className="space-x-1.5 text-sm text-gray-500">
                    <span>
                      {startTime ? formatDate(startTime, 'yyyy-MM-dd HH:mm') : '[开始时间]'}
                    </span>
                    <span>-</span>
                    <span>{endTime ? formatDate(endTime, 'yyyy-MM-dd HH:mm') : '[结束时间]'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <>
                <div>
                  <div
                    ref={descRef}
                    className={cn(`text-primary`, isDescExpanded ? '' : 'line-clamp-3')}
                  >
                    {description}
                  </div>
                  {isDescExpandable && (
                    <div className="mt-1 flex items-center gap-4">
                      <Separator className="flex-1 bg-transparent" />
                      {isDescExpanded ? (
                        <span
                          className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground/80"
                          onClick={toggleDescExpand}
                        >
                          点击收起 <ChevronUpIcon className="h-3 w-3" />
                        </span>
                      ) : (
                        <span
                          className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground"
                          onClick={toggleDescExpand}
                        >
                          点击展开 <ChevronDownIcon className="h-3 w-3" />
                        </span>
                      )}
                      <Separator className="flex-1 bg-transparent" />
                    </div>
                  )}
                </div>

                <RaffleStatusButton type="not-started" />
              </>
            </div>
          </div>

          <Separator className="mb-6 mt-14 bg-gray-300/70" />

          <div className="space-y-2">
            <RaffleRecipientList claimed={emptyClaimed} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RaffleActivityPreview() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RaffleActivityPreviewPage />
    </Suspense>
  );
}
