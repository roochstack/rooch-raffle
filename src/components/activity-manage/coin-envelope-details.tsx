'use client';

import { useCoinBalances } from '@/hooks/use-coin-balances';
import { CoinEnvelopeItem } from '@/interfaces';
import { formatDate } from 'date-fns';
import { useTranslations } from 'next-intl';
import { CoinLabel } from '../coin-label';
import { useMemo } from 'react';
import { RiDiscordFill, RiTelegram2Fill, RiTwitterXFill } from 'react-icons/ri';
import { TbWorld } from 'react-icons/tb';
import { TwitterIcon } from 'lucide-react';

interface CoinEnvelopeDetailsProps {
  data: CoinEnvelopeItem;
}

export default function CoinEnvelopeDetails({ data }: CoinEnvelopeDetailsProps) {
  const t = useTranslations();
  const coinBalancesResp = useCoinBalances();

  const selectedCoin = coinBalancesResp.data.find((coin) => coin.coinType === data.coinType);

  const formattedTotalCoin = useMemo(() => {
    if (coinBalancesResp.data.length === 0) {
      return;
    }

    const matchedCoin = coinBalancesResp.data.find((coin) => coin.coinType === data.coinType);

    if (!matchedCoin) {
      return;
    }

    if (data.totalCoin && data.totalEnvelope && data.envelopeType === 'average') {
      return (
        (Number(data.totalCoin) / Number(data.totalEnvelope) / 10 ** matchedCoin.decimals)
          .toFixed(matchedCoin.decimals)
          // Remove trailing zeros
          .replace(/\.?0+$/, '')
      );
    }

    return (
      (Number(data.totalCoin) / 10 ** matchedCoin.decimals)
        .toFixed(matchedCoin.decimals)
        // Remove trailing zeros
        .replace(/\.?0+$/, '')
    );
  }, [data.totalCoin, data.totalEnvelope, data.envelopeType, coinBalancesResp.data]);

  return (
    <div>
      <dl className="grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto] sm:text-sm/6">
        <dt className="col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:py-3">
          {t('activities.create.form.name')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {data.name}
        </dd>
        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {t('weary_fuzzy_ostrich_catch')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {formatDate(data.createdAt, 'yyyy-MM-dd HH:mm:ss')}
        </dd>

        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {t('activities.create.form.startTime')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {formatDate(data.startTime, 'yyyy-MM-dd HH:mm:ss')}
        </dd>

        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {t('activities.create.form.endTime')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {formatDate(data.endTime, 'yyyy-MM-dd HH:mm:ss')}
        </dd>

        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {t('activities.create.form.assetType.label')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {data.assetType === 'coin' && (
            <span className="flex items-center gap-1">
              <span className="text-gray-500">
                {t('activities.create.form.assetType.coin.emoji')}
              </span>
              <span>{t('activities.create.form.assetType.coin.label')}</span>
            </span>
          )}
        </dd>

        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {t('activities.create.form.envelopeType.label')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {data.envelopeType === 'random' && (
            <span className="flex items-center gap-1">
              <span className="text-gray-500">
                {t('activities.create.form.envelopeType.random.emoji')}
              </span>
              <span>{t('activities.create.form.envelopeType.random.title')}</span>
            </span>
          )}
          {data.envelopeType === 'average' && (
            <span className="flex items-center gap-1">
              <span className="text-gray-500">
                {t('activities.create.form.envelopeType.average.emoji')}
              </span>
              <span>{t('activities.create.form.envelopeType.average.title')}</span>
            </span>
          )}
        </dd>

        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {t('activities.create.form.reward.label')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {selectedCoin && <CoinLabel {...selectedCoin} />}
        </dd>

        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {t('activities.create.form.quantity.label')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {data.totalEnvelope}
        </dd>

        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {data.envelopeType === 'random'
            ? t('activities.create.form.amount.label')
            : t('activities.create.form.amount.perAmount')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {formattedTotalCoin}
        </dd>

        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {t('activities.create.form.participationConditions.title')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {data.requireTwitterBinding ? (
            <span className="flex items-center gap-2">
              <TwitterIcon className="h-4 w-4" />
              {t('crazy_only_cougar_yell')}
            </span>
          ) : (
            <span>{t('great_raw_duck_greet')}</span>
          )}
        </dd>

        {/* 社交链接 */}
        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {t('activities.create.form.socialLinks.title')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {data.socialLinks && data.socialLinks.length > 0 ? (
            <div className="space-y-2">
              {data.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-500">
                    {link.platform === 'twitter' && (
                      <RiTwitterXFill className="h-4.5 w-4.5 text-gray-500" />
                    )}
                    {link.platform === 'telegram' && (
                      <RiTelegram2Fill className="h-4.5 w-4.5 text-gray-500" />
                    )}
                    {link.platform === 'discord' && (
                      <RiDiscordFill className="h-4.5 w-4.5 text-gray-500" />
                    )}
                    {link.platform === 'website' && (
                      <TbWorld className="h-4.5 w-4.5 text-gray-500" />
                    )}
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link.url}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <span>{t('activities.create.form.socialLinks.empty')}</span>
          )}
        </dd>

        {/* 弹窗配置 */}
        <dt className="sm: col-start-1 border-gray-950/5 pt-3 text-gray-500 first:border-none sm:border-gray-950/5 sm:py-3">
          {t('activities.create.form.claimDialogButton.title')}
        </dt>
        <dd className="sm: pb-3 pt-1 text-gray-950 sm:border-gray-950/5 sm:py-3 sm:[&:nth-child(2)]:border-none">
          {data.claimDialogConfig ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">🔗</span>
                <a
                  href={data.claimDialogConfig.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data.claimDialogConfig.buttonUrl}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">🇺🇸</span>
                <span>{data.claimDialogConfig.buttonTextEN}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">🇨🇳</span>
                <span>{data.claimDialogConfig.buttonTextZH}</span>
              </div>
            </div>
          ) : (
            <span>{t('activities.create.form.claimDialogButton.empty')}</span>
          )}
        </dd>
      </dl>
    </div>
  );
}
