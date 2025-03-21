'use client';

import React, { useState, useMemo } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { HashAvatar } from '../hash-avatar';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClaimedItem } from '@/interfaces';
import { formatDate } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { formatUnits } from '@/utils/kit';
import { useWalletHexAddress } from '@/hooks';
import { useTranslations } from 'next-intl';
import { Credenza, CredenzaContent, CredenzaHeader, CredenzaTitle } from '../ui/credenza';

interface EnvelopeRecipientListProps {
  claimed: ClaimedItem[];
  loading?: boolean;
  coinDecimals: number;
  coinSymbol: string;
}

const EnvelopeRecipientList = ({
  claimed,
  loading,
  coinDecimals,
  coinSymbol,
}: EnvelopeRecipientListProps) => {
  const t = useTranslations('activities.envelope.participantList');
  const tCommon = useTranslations('common');
  const [showAll, setShowAll] = useState(false);
  const walletAddress = useWalletHexAddress();

  const shortClaimed = useMemo(() => {
    return claimed.slice(0, 5);
  }, [claimed]);

  const yourClaimed = claimed.find((item) => item.address === walletAddress);
  const otherClaimed = claimed.filter((item) => item.address !== walletAddress);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{t('title')}</span>
        {loading ? (
          <Skeleton className="h-3 w-10" />
        ) : shortClaimed.length ? (
          <div
            className="flex cursor-pointer items-center space-x-1 text-gray-500 transition-all hover:text-gray-900"
            onClick={() => setShowAll(!showAll)}
          >
            <div className="flex -space-x-3 overflow-hidden transition-all">
              {shortClaimed.map((item, i) => (
                <div
                  key={i}
                  className="inline-block h-5 w-5 rounded-full border-2 border-white/80 bg-gray-200 shadow-sm"
                >
                  <HashAvatar className="h-full w-full" address={item.address} />
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-1">
              {shortClaimed.length < claimed.length && (
                <span className="text-sm">
                  {t('count', { count: claimed.length })}
                </span>
              )}
              <ChevronRightIcon className="h-4 w-4" />
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">{tCommon('noData')}</span>
        )}
      </div>

      <Credenza open={showAll} onOpenChange={setShowAll}>
        <CredenzaContent className="bg-white w-full px-4 md:w-[560px]">
          <CredenzaHeader>
            <CredenzaTitle>{t('title')}</CredenzaTitle>
          </CredenzaHeader>
          <div className="space-y-2 max-h-[300px] md:max-h-[700px] overflow-y-auto">
            {yourClaimed && (
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-4 justify-between md:justify-start">
                  <a href={`https://portal.rooch.network/assets/${yourClaimed.address}`} target="_blank" className="flex items-center space-x-1 hover:underline">
                    <div className="inline-block h-6 w-6 rounded-full border-2 border-white bg-gray-200">
                      <HashAvatar className="h-full w-full" address={yourClaimed.address} />
                    </div>
                    <span className="font-mono min-w-[156px] text-sm text-gray-700">
                      {`${yourClaimed.address.slice(0, 4)}...${yourClaimed.address.slice(-6)}`}
                      <span className="ml-2 rounded-sm bg-gray-200 px-1 py-0.5 text-xs text-gray-500">
                        {tCommon('you')}
                      </span>
                    </span>
                  </a>

                  <span className="text-sm text-gray-500">
                    <span className="inline-block min-w-16 text-right">
                      {formatUnits(yourClaimed.amount, coinDecimals, 4)}
                    </span>
                    <span className="ml-0.5 text-xs">{coinSymbol}</span>
                  </span>
                </div>

                <span className="text-sm text-gray-500 hidden md:flex gap-1">
                  <span>{formatDate(yourClaimed.claimedAt, 'yyyy-MM-dd')}</span>
                  <span className='min-w-[60px]'>{formatDate(yourClaimed.claimedAt, 'HH:mm:ss')}</span>
                </span>
              </div>
            )}
            {otherClaimed.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center gap-4 justify-between md:justify-start">
                  <a
                    href={`https://portal.rooch.network/assets/${item.address}`}
                    target="_blank"
                    className="flex items-center space-x-1 hover:underline"
                  >
                    <div className="inline-block h-6 w-6 rounded-full border-2 border-white bg-gray-200">
                      <HashAvatar className="h-full w-full" address={item.address} />
                    </div>
                    <span className="font-mono min-w-[156px] text-sm text-gray-700">
                      {`${item.address.slice(0, 4)}...${item.address.slice(-6)}`}
                    </span>
                  </a>

                  <span className="text-sm text-gray-500">
                    <span className="inline-block min-w-16 text-right">
                      {formatUnits(item.amount, coinDecimals, 4)}
                    </span>
                    <span className="ml-0.5 text-xs">{coinSymbol}</span>
                  </span>
                </div>

                <span className="text-sm text-gray-500 hidden md:flex gap-1">
                  <span>{formatDate(item.claimedAt, 'yyyy-MM-dd')}</span>
                  <span className='min-w-[60px]'>{formatDate(item.claimedAt, 'HH:mm:ss')}</span>
                </span>
              </div>
            ))}
          </div>
        </CredenzaContent>
      </Credenza>
    </div >
  );
};

export default EnvelopeRecipientList;
