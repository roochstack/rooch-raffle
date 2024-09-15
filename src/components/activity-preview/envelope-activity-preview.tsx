'use client';

import { useSearchParams } from 'next/navigation';
import CoinActivityPreview from './coin-activity-preview';
import NftActivityPreview from './nft-activity-preview';
import { Suspense } from 'react';

function EnvelopeActivityPreviewPage() {
  const searchParams = useSearchParams();
  const assetType = searchParams.get('assetType');
  const coverImageUrl = searchParams.get('coverImageUrl');
  const activityName = searchParams.get('activityName');
  const status = 'not-started';
  const startTimeTimestamp = searchParams.get('startTimeTimestamp');
  const endTimeTimestamp = searchParams.get('endTimeTimestamp');
  const startTime = startTimeTimestamp ? new Date(parseInt(startTimeTimestamp, 10)) : undefined;
  const endTime = endTimeTimestamp ? new Date(parseInt(endTimeTimestamp, 10)) : undefined;

  if (assetType === 'coin') {
    const totalCoin = searchParams.get('totalCoin');
    const coinType = searchParams.get('coinType');
    const coinName = searchParams.get('coinName');
    const coinSymbol = searchParams.get('coinSymbol');
    return (
      <CoinActivityPreview
        coverImageUrl={coverImageUrl}
        activityName={activityName}
        status={status}
        startTime={startTime}
        endTime={endTime}
        totalCoin={totalCoin}
        coinType={coinType}
        coinName={coinName}
        coinSymbol={coinSymbol}
      />
    );
  }

  if (assetType === 'nft') {
    const nftCount = searchParams.get('nftCount');
    return (
      <NftActivityPreview
        coverImageUrl={coverImageUrl}
        activityName={activityName}
        status={status}
        startTime={startTime}
        endTime={endTime}
        nftCount={nftCount ? parseInt(nftCount, 10) : null}
      />
    );
  }

  return null;
}

export const EnvelopeActivityPreview = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EnvelopeActivityPreviewPage />
    </Suspense>
  );
};
