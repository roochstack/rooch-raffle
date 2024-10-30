import React from 'react';
import { formatDate } from 'date-fns';
import EnvelopeStatusButton from '@/components/activity/envelope-status-button';
import StatusBadge from '@/components/activity/status-badge';
import { Separator } from '@/components/ui/separator';
import { ActivityStatus } from '@/interfaces';
import { formatCoinType } from '@/utils/kit';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import PreviewBanner from './preview-banner';
import { useTranslations } from 'next-intl';

interface CoinActivityPreviewProps {
  coverImageUrl?: string | null;
  activityName?: string | null;
  status: ActivityStatus;
  startTime?: Date | null;
  endTime?: Date | null;
  totalCoin?: string | null;
  coinType?: string | null;
  coinName?: string | null;
  coinSymbol?: string | null;
}

export default function CoinActivityPreview({
  coverImageUrl,
  activityName,
  status,
  startTime,
  endTime,
  totalCoin,
  coinType,
  coinName,
  coinSymbol,
}: CoinActivityPreviewProps) {
  const t = useTranslations('activities.preview');

  return (
    <>
      <PreviewBanner />
      <div className="relative mt-28 flex min-h-[100vh] w-full md:items-center md:justify-center">
        <div
          className="fixed left-0 top-0 h-full w-full bg-cover bg-center opacity-15 blur-[80px] brightness-125 saturate-200"
          style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : {}}
        />

        <div className="container flex max-w-5xl flex-col gap-8 px-6 md:mt-[-200px] md:flex-row md:gap-14 xl:gap-20">
          <img
            src={coverImageUrl || '/placeholder.svg'}
            alt="preview-activity"
            className="pointer-events-none z-[-1] h-auto w-full rounded-lg object-cover shadow-xl drop-shadow-lg md:w-1/2 md:max-w-[488px]"
          />

          {/* activity info section */}

          <div className="relative mt-8 flex-grow lg:mt-0">
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h1 className="text-5xl font-bold leading-none text-gray-900">
                    {activityName || t('placeholder.activityName')}
                  </h1>
                </div>

                {/* status section */}

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={status} />
                    <span className="space-x-1.5 text-sm text-gray-500">
                      <span>
                        {startTime ? formatDate(startTime, 'yyyy-MM-dd HH:mm') : t('placeholder.startTime')}
                      </span>
                      <span>-</span>
                      <span>
                        {endTime ? formatDate(endTime, 'yyyy-MM-dd HH:mm') : t('placeholder.endTime')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="flex items-center space-x-2 text-3xl font-bold leading-none text-gray-900">
                    <span>{t('coin.share')}</span>
                    <span>{totalCoin || t('placeholder.totalAmount')}</span>
                    <span>{coinSymbol || t('placeholder.symbol')}</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className="cursor-pointer border-b border-dashed border-gray-400 transition-all hover:border-gray-600">
                          {coinSymbol || '[SYMBOL]'}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="w-50 p-3">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium leading-none">
                              {coinName || t('placeholder.coinName')}
                            </div>
                            <p className="font-mono text-xs text-muted-foreground">
                              {coinType ? formatCoinType(coinType) : t('placeholder.coinType')}
                            </p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </h3>
                </div>
                <EnvelopeStatusButton type="not-started" />
              </div>
            </div>

            <Separator className="mb-4 mt-8 bg-gray-300/70 md:mb-6 md:mt-14" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('coin.claimedCount')}</span>
                <span className="text-sm">0</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('coin.claimedAmount')}</span>
                <span className="space-x-1 text-sm leading-none text-gray-500">
                  <span>0</span>
                  <span>/</span>
                  <span>{totalCoin || t('placeholder.totalAmount')}</span>
                  <span className="text-xs">{coinSymbol || t('placeholder.symbol')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
