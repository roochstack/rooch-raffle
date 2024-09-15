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
  const [showAll, setShowAll] = useState(false);
  const walletAddress = useWalletHexAddress();

  const shortClaimed = useMemo(() => {
    return claimed.slice(0, 5);
  }, [claimed]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">已领取人数</span>
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
                <span className="text-sm">+{claimed.length - shortClaimed.length} </span>
              )}
              <ChevronRightIcon className="h-4 w-4" />
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">无人领取</span>
        )}
      </div>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>领取列表</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {claimed.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <div className="inline-block h-6 w-6 rounded-full border-2 border-white bg-gray-200">
                    <HashAvatar className="h-full w-full" address={item.address} />
                  </div>
                  <span className="font-mono text-sm text-gray-700">
                    {`${item.address.slice(0, 4)}...${item.address.slice(-6)}`}

                    {item.address === walletAddress && (
                      <span className="ml-2 rounded-sm bg-gray-200 px-1 py-0.5 text-xs text-gray-500">
                        You
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatUnits(item.amount, coinDecimals)}
                  <span className="ml-0.5 text-xs">{coinSymbol}</span>
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(item.claimedAt, 'yyyy-MM-dd HH:mm:ss')}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnvelopeRecipientList;
