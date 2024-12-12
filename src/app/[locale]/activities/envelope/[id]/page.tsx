import EnvelopeActivity from '@/components/activity/envelope/envelope-activity';
import { formatCoverImageUrl, formatUnits } from '@/utils/kit';
import { fetchCoinInfo, fetchEnvelopeData } from '@/utils/request';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ id: string, locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { id, locale } = await params
  const t = await getTranslations({ locale })

  try {
    const detail = await fetchEnvelopeData(id)
    const coinInfo = await fetchCoinInfo(detail.coinType)
    return {
      title: `${detail.name} - Rooch Raffle`,
      description: `${t('activities.preview.coin.share')} ${formatUnits(detail.totalCoin, coinInfo.decimals!)} ${coinInfo.symbol}`,
      openGraph: {
        images: [formatCoverImageUrl(detail.coverImageUrl)],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      title: 'Rooch Raffle',
      description: 'Rooch Raffle',
    };
  }
}

export default function PreviewPage({ params }: { params: { id: string } }) {
  return <EnvelopeActivity id={params.id} />;
}
