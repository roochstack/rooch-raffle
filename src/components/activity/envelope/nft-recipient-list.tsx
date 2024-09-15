'use client';

import { HashAvatar } from '@/components/hash-avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useWalletHexAddress } from '@/hooks';
import { ChevronRightIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

interface NftRecipientListProps {
  claimedAddressList: string[];
  loading?: boolean;
}

const NftRecipientList = ({ claimedAddressList, loading }: NftRecipientListProps) => {
  const [showAll, setShowAll] = useState(false);
  const walletAddress = useWalletHexAddress();

  const shortClaimed = useMemo(() => {
    return claimedAddressList.slice(0, 5);
  }, [claimedAddressList]);

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
              {shortClaimed.map((address, i) => (
                <div
                  key={i}
                  className="inline-block h-5 w-5 rounded-full border-2 border-white/80 bg-gray-200 shadow-sm"
                >
                  <HashAvatar className="h-full w-full" address={address} />
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-1">
              {shortClaimed.length < claimedAddressList.length && (
                <span className="text-sm">+{claimedAddressList.length - shortClaimed.length} </span>
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
            {claimedAddressList.map((item, i) => (
              <div key={i} className="flex items-center space-x-1">
                <div className="inline-block h-6 w-6 rounded-full border-2 border-white bg-gray-200">
                  <HashAvatar className="h-full w-full" address={item} />
                </div>
                <span className="font-mono text-sm text-gray-700">
                  {`${item.slice(0, 4)}...${item.slice(-6)}`}

                  {item === walletAddress && (
                    <span className="ml-2 rounded-sm bg-gray-200 px-1 py-0.5 text-xs text-gray-500">
                      You
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NftRecipientList;
