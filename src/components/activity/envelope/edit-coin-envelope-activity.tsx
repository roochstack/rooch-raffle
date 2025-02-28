'use client';

import { ActivityFormLayout } from '@/components/activity-create/activity-form-layout';
import { CoverImageDialog } from '@/components/cover-image-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LoadingButtonStatus } from '@/components/ui/loading-button';
import { useCoinBalances, useWalletHexAddress } from '@/hooks';
import { useActivityImageUpload } from '@/hooks/use-image-upload';
import { useExtendEnvelopeEndTime, useUpdateEnvelope } from '@/hooks/use-update-envelope';
import { CoinEnvelopeItem } from '@/interfaces';
import { formatCoverImageUrl, formatUnits } from '@/utils/kit';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpRightIcon, ImageIcon, Terminal } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { RadioCardGroup } from '@/components/ui/radio-card-group';
import { useCurrentWallet } from '@roochnetwork/rooch-sdk-kit';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import EnvelopeStatusEditButton from './envelope-status-edit-button';
import { CoinSelect } from '@/components/ui/coin-select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import pickBy from 'lodash/pickBy';

interface ActivityProps {
  data: CoinEnvelopeItem;
}

interface FormValues {
  activityName: string;
  startTime: Date;
  endTime: Date;
  requireTwitterBinding: boolean;
  assetType: 'coin' | 'nft';
  envelopeType: 'random' | 'average';
  totalEnvelope: string;
  totalCoin: string;
  coinType: string;
}

export default function EditCoinEnvelopeActivity({ data }: ActivityProps) {
  const locale = useLocale();
  const coinBalancesResp = useCoinBalances();
  const updateEnvelope = useUpdateEnvelope();
  const extendEnvelopeEndTime = useExtendEnvelopeEndTime();
  const walletAddress = useWalletHexAddress();

  const { isConnected: isWalletConnected } = useCurrentWallet();
  const [coverImageUrl, setCoverImageUrl] = useState(data.coverImageUrl);
  const [coverImageDialogOpen, setCoverImageDialogOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<LoadingButtonStatus>('idle');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('activities.create.form');
  const tRoot = useTranslations();
  const tCommon = useTranslations('common');
  const tEdit = useTranslations('activities.envelope.edit');

  const nameEditable = data.status === 'not-started';
  const startTimeEditable = data.status === 'not-started';
  const twitterBindingEditable = data.status === 'not-started';

  useEffect(() => {
    if (coinBalancesResp.data.length === 0) {
      return;
    }

    const matchedCoin = coinBalancesResp.data.find((coin) => coin.coinType === data.coinType);

    if (!matchedCoin) {
      return;
    }

    if (data.totalCoin && data.totalEnvelope && data.envelopeType === 'average') {
      form.setValue(
        'totalCoin',
        (Number(data.totalCoin) / Number(data.totalEnvelope) / 10 ** matchedCoin.decimals)
          .toFixed(matchedCoin.decimals)
          // Remove trailing zeros
          .replace(/\.?0+$/, '')
      );
    }
  }, [data, coinBalancesResp]);

  const formSchema = useMemo(() => {
    const schema = z
      .object({
        activityName: z
          .string()
          .min(1, { message: t('validation.nameRequired') })
          .max(200),
        startTime: z.date(),
        endTime:
          data.status === 'not-started'
            ? z.date()
            : z.date().min(data.endTime, {
                message: tRoot('soft_basic_robin_clap'),
              }),
        requireTwitterBinding: z.boolean(),
      })
      .refine(
        (data) => {
          return data.endTime > data.startTime;
        },
        {
          message: t('validation.endTimeInvalid'),
          path: ['endTime'],
        }
      );
    return schema;
  }, [t, data]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityName: data.name,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      coinType: data.coinType,
      requireTwitterBinding: data.requireTwitterBinding,
      assetType: data.assetType,
      envelopeType: data.envelopeType,
      totalEnvelope: data.totalEnvelope.toString(),
      totalCoin: data.envelopeType === 'random' ? data.totalCoin.toString() : '',
    },
  });

  const handleImageUpload = useActivityImageUpload({
    onImageChange: setCoverImageUrl,
    sizeLimit: 100,
    onSizeExceeded: () => {
      alert(t('imageUpload.sizeLimit'));
    },
  });

  const updateHandler = data.status === 'not-started' ? updateEnvelope : extendEnvelopeEndTime;
  const onSubmit = async (formData: FormValues) => {
    if (submitStatus === 'success') {
      return;
    }

    formData.startTime.setSeconds(0);
    formData.startTime.setMilliseconds(0);
    formData.endTime.setSeconds(0);
    formData.endTime.setMilliseconds(0);

    const submitData = {
      activityName: formData.activityName,
      description: '',
      coverImageUrl,
      themeMode: 0,
      colorMode: 0,
      startTime: formData.startTime,
      endTime: formData.endTime,
      requireTwitterBinding: formData.requireTwitterBinding,
      coinType: data.coinType,
    };

    try {
      setSubmitStatus('loading');
      await updateHandler(data.id, submitData);
      setSubmitStatus('success');
      window.setTimeout(() => {
        router.push(`/activities/envelope/manage/${data.id}`);
      }, 1000);
    } catch (error) {
      setSubmitStatus('error');
    }
  };

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
      <div className="h-full w-full">
        <div className="container mx-auto max-w-5xl space-y-6 overflow-hidden p-6 pt-11 md:flex-row">
          <h1 className="text-3xl font-bold">{tEdit('title')}</h1>
          <ActivityFormLayout>
            <ActivityFormLayout.ImageContainer className="hover:[&_div]:bg-gray-600">
              <img
                src={formatCoverImageUrl(coverImageUrl)}
                alt="cover image"
                className="h-full w-full object-cover"
              />
              <div
                title="Change Cover Image"
                className="absolute bottom-4 right-4 cursor-pointer rounded-lg border border-gray-200 bg-gray-900 p-1.5 transition-all"
                onClick={() => setCoverImageDialogOpen(true)}
              >
                <ImageIcon className="h-4 w-4 text-gray-200" />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </ActivityFormLayout.ImageContainer>

            <ActivityFormLayout.FormContainer>
              {data.status === 'not-started' && (
                <div className="px-6">
                  <Alert variant="warning">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>{tEdit('editWarning.title')}</AlertTitle>
                    <AlertDescription>{tEdit('editWarning.content')}</AlertDescription>
                  </Alert>
                </div>
              )}
              {data.status === 'ongoing' && (
                <div className="px-6">
                  <Alert variant="warning">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>{tEdit('extendEndTimeWarning.title')}</AlertTitle>
                    <AlertDescription>{tEdit('extendEndTimeWarning.content')}</AlertDescription>
                  </Alert>
                </div>
              )}
              <Form {...form}>
                <form
                  className="space-y-10 rounded-lg bg-white p-6 shadow-sm"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="activityName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('name')}</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!nameEditable}
                              placeholder={t('namePlaceholder')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-4 max-md:flex-col md:items-center">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem className="md:w-1/2">
                            <FormLabel>{t('time.start')}</FormLabel>
                            <FormControl>
                              <DateTimePicker
                                disabled={!startTimeEditable}
                                {...field}
                                format="yyyy-MM-dd HH:mm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem className="md:w-1/2">
                            <FormLabel>{t('time.end')}</FormLabel>
                            <FormControl>
                              <DateTimePicker {...field} format="yyyy-MM-dd HH:mm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="assetType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('assetType.label')}</FormLabel>
                          <FormControl>
                            <RadioCardGroup
                              disabled={true}
                              options={[
                                {
                                  value: 'coin',
                                  id: 'assetType-coin',
                                  emoji: t('assetType.coin.emoji'),
                                  label: t('assetType.coin.label'),
                                },
                                {
                                  value: 'nft',
                                  id: 'assetType-nft',
                                  emoji: t('assetType.nft.emoji'),
                                  label: t('assetType.nft.label'),
                                },
                              ]}
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>{t('assetType.description')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {data.assetType === 'coin' && (
                      <FormField
                        control={form.control}
                        name="envelopeType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('envelopeType.label')}</FormLabel>
                            <FormControl>
                              <RadioCardGroup
                                disabled={true}
                                variant="detailed"
                                options={[
                                  {
                                    value: 'random',
                                    id: 'envelopeType-random',
                                    emoji: t('envelopeType.random.emoji'),
                                    label: t('envelopeType.random.title'),
                                    description: t('envelopeType.random.description'),
                                  },
                                  {
                                    value: 'average',
                                    id: 'envelopeType-average',
                                    emoji: t('envelopeType.average.emoji'),
                                    label: t('envelopeType.average.title'),
                                    description: t('envelopeType.average.description'),
                                  },
                                ]}
                                value={field.value}
                                onValueChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {data.assetType === 'coin' && data.coinType && (
                      <FormField
                        control={form.control}
                        name="coinType"
                        render={({ field }) => (
                          <FormItem className="md:w-1/2">
                            <FormLabel>{t('reward.label')}</FormLabel>
                            <FormControl>
                              <CoinSelect
                                disabled={true}
                                value={field.value}
                                coinBalances={coinBalancesResp.data}
                                isLoading={coinBalancesResp.isLoading}
                                placeholder={t('reward.selectCoin')}
                                searchPlaceholder={t('reward.searchCoin')}
                                noResultText={t('reward.noCoinFound')}
                                name="coinType"
                                form={form}
                              />
                            </FormControl>
                            {field.value && (
                              <FormDescription>
                                {t('reward.balance')}
                                {formatUnits(
                                  coinBalancesResp.data.find(
                                    (coin) => coin.coinType === field.value
                                  )?.balance ?? 0n,
                                  coinBalancesResp.data.find(
                                    (coin) => coin.coinType === field.value
                                  )?.decimals
                                )}
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="totalEnvelope"
                      render={({ field }) => (
                        <FormItem className="md:w-1/2">
                          <FormLabel>{t('quantity.label')}</FormLabel>
                          <FormControl>
                            <Input
                              disabled={true}
                              type="number"
                              min={1}
                              {...field}
                              readOnly={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalCoin"
                      render={({ field }) => (
                        <FormItem className="md:w-1/2">
                          <FormLabel>
                            {form.watch('envelopeType') === 'random'
                              ? t('amount.label')
                              : t('amount.perAmount')}
                          </FormLabel>
                          <FormControl>
                            {data.envelopeType === 'average' && coinBalancesResp.isPending ? (
                              <Input disabled={true} value={tCommon('loading')} readOnly={true} />
                            ) : (
                              <Input
                                disabled={true}
                                type="number"
                                min={0}
                                step={0.000000001}
                                {...field}
                                readOnly={true}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="requireTwitterBinding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('participationConditions.title')}</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                disabled={!twitterBindingEditable}
                                id={field.name}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <FormLabel htmlFor={field.name}>
                                {t('requireTwitterBinding.label')}
                              </FormLabel>
                            </div>
                          </FormControl>
                          <FormDescription>
                            {t('requireTwitterBinding.description')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {!isWalletConnected && (
                    <EnvelopeStatusEditButton
                      type="wallet-not-connected"
                      submitStatus={submitStatus}
                    />
                  )}

                  {isWalletConnected && walletAddress !== data.sender && (
                    <EnvelopeStatusEditButton type="not-owner" submitStatus={submitStatus} />
                  )}

                  {isWalletConnected &&
                    walletAddress === data.sender &&
                    data.status === 'ongoing' && (
                      <EnvelopeStatusEditButton type="ongoing" submitStatus={submitStatus} />
                    )}

                  {isWalletConnected &&
                    walletAddress === data.sender &&
                    data.status === 'ended' && (
                      <EnvelopeStatusEditButton type="ended" submitStatus={submitStatus} />
                    )}

                  {isWalletConnected &&
                    walletAddress === data.sender &&
                    data.status === 'not-started' && (
                      <EnvelopeStatusEditButton type="not-started" submitStatus={submitStatus} />
                    )}
                </form>
              </Form>

              <div className="mt-4 flex justify-center">
                <div
                  onClick={() => {
                    const updatedData = {
                      ...data,
                      ...pickBy(form.getValues(), (value) => value !== undefined),
                    };

                    const searchParams = new URLSearchParams();
                    searchParams.set('assetType', updatedData.assetType);
                    searchParams.set('totalCoin', updatedData.totalCoin.toString());
                    searchParams.set('totalEnvelope', updatedData.totalEnvelope.toString());
                    searchParams.set('activityName', updatedData.name);
                    searchParams.set(
                      'startTimeTimestamp',
                      updatedData.startTime.getTime().toString()
                    );
                    searchParams.set('endTimeTimestamp', updatedData.endTime.getTime().toString());
                    searchParams.set('coverImageUrl', coverImageUrl);

                    const coin = coinBalancesResp.data.find(
                      (c) => c.coinType === updatedData.coinType
                    );
                    if (coin) {
                      searchParams.set('coinType', coin.coinType);
                      searchParams.set('coinName', coin.name);
                      searchParams.set('coinSymbol', coin.symbol);
                    }

                    window.open(
                      `/${locale}/activities/envelope/preview?${searchParams.toString()}`,
                      '_blank'
                    );
                  }}
                  className="inline-flex cursor-pointer items-center justify-center text-sm text-gray-500 transition-all hover:text-gray-700 hover:underline"
                >
                  <span>{tCommon('previewPage')}</span>
                  <ArrowUpRightIcon className="ml-1 h-4 w-4" />
                </div>
              </div>
              <CoverImageDialog
                open={coverImageDialogOpen}
                onOpenChange={setCoverImageDialogOpen}
                onSelect={setCoverImageUrl}
              />
            </ActivityFormLayout.FormContainer>
          </ActivityFormLayout>
        </div>
      </div>
    </div>
  );
}
