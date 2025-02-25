import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { useCoinBalances, useWalletHexAddress } from '@/hooks';
import { cn } from '@/lib/utils';
import { formatCoverImageUrl } from '@/utils/kit';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ArrowUpRightIcon } from 'lucide-react';
import { LoadingButtonStatus } from '@/components/ui/loading-button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ActivityFormLayout } from '@/components/activity-create/activity-form-layout';
import { useLocale, useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { CoinEnvelopeItem } from '@/interfaces';
import { useExtendEnvelopeEndTime } from '@/hooks/use-update-envelope';

import { useMemo } from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useCurrentWallet } from '@roochnetwork/rooch-sdk-kit';
import EnvelopeStatusExtendEndTimeButton from './envelope-status-extend-end-time-button';

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
}

export default function ExtendCoinEnvelopeEndTimePage({ data }: ActivityProps) {
  const locale = useLocale();
  const coinBalancesResp = useCoinBalances();
  const extendEnvelopeEndTime = useExtendEnvelopeEndTime();
  const walletAddress = useWalletHexAddress();
  const { isConnected: isWalletConnected } = useCurrentWallet();
  const [submitStatus, setSubmitStatus] = useState<LoadingButtonStatus>('idle');
  const router = useRouter();
  const t = useTranslations('activities.create.form');
  const tCommon = useTranslations('common');
  const tEdit = useTranslations('activities.envelope.edit');

  const formSchema = useMemo(() => {
    const schema = z
      .object({
        endTime: z.date(),
      })
      .refine(
        (formData) => {
          return formData.endTime > data.endTime;
        },
        {
          message: t('validation.endTimeInvalid'),
          path: ['endTime'],
        }
      );
    return schema;
  }, [t, data]);

  // TODO: 计算展示的金额
  // const selectedCoin = coinBalancesResp.data.find((coin) => coin.coinType === data.coinType)!;
  // const totalCoin = Number(data.totalCoin) / 10 ** selectedCoin.decimals;
  // const showTotalCoin =
  //   data.envelopeType === 'random'
  //     ? totalCoin.toString()
  //     : (totalCoin / Number(data.totalEnvelope)).toString();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityName: data.name,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      requireTwitterBinding: data.requireTwitterBinding,
      assetType: data.assetType,
      envelopeType: data.envelopeType,
      totalEnvelope: data.totalEnvelope.toString(),
      totalCoin: data.totalCoin.toString(),
    },
  });

  const onSubmit = async (formData: FormValues) => {
    if (submitStatus === 'success') {
      return;
    }
    formData.endTime.setSeconds(0);
    formData.endTime.setMilliseconds(0);

    try {
      setSubmitStatus('loading');
      await extendEnvelopeEndTime(data.id, formData.endTime, data.coinType);
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
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{tEdit('title')}</h1>
          </div>
        </div>
        <ActivityFormLayout>
          <ActivityFormLayout.ImageContainer className="hover:[&_div]:bg-gray-600">
            <img
              src={formatCoverImageUrl(data.coverImageUrl)}
              alt="cover image"
              className="h-full w-full object-cover"
            />
          </ActivityFormLayout.ImageContainer>

          <ActivityFormLayout.FormContainer>
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
                          <Input placeholder={t('namePlaceholder')} {...field} />
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
                            <DateTimePicker {...field} format="yyyy-MM-dd HH:mm" />
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
                          <RadioGroup
                            className="flex"
                            {...field}
                            onValueChange={(v) => {
                              field.onChange(v);
                            }}
                            disabled={true}
                          >
                            <>
                              <RadioGroupItem
                                value="coin"
                                id="assetType-coin"
                                className="sr-only"
                              />
                              <Label
                                htmlFor="assetType-coin"
                                className={cn(
                                  'flex min-w-[124px] cursor-pointer items-start justify-start space-x-2 rounded-lg border py-2 pl-3 pr-4 transition-all hover:border-primary',
                                  field.value === 'coin' && 'border-primary'
                                )}
                              >
                                <div className="text-sm">{t('assetType.coin.emoji')}</div>
                                <div className="text-sm">{t('assetType.coin.label')}</div>
                              </Label>
                            </>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>{t('assetType.description')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="envelopeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('envelopeType.label')}</FormLabel>
                        <FormControl>
                          <RadioGroup className="flex" {...field} disabled={true}>
                            <div
                              className={cn(
                                'flex cursor-pointer items-start space-x-2 rounded-lg border py-2 pl-1 pr-4 transition-all hover:border-primary',
                                field.value === 'random' && 'border-primary'
                              )}
                            >
                              <RadioGroupItem
                                value="random"
                                id="envelopeType-random"
                                className="sr-only"
                              />
                              <Label
                                onClick={() => {
                                  field.onChange('random');
                                }}
                                htmlFor="envelopeType-random"
                                className="flex cursor-pointer items-start justify-start space-x-2"
                              >
                                <div className="text-sm">{t('envelopeType.random.emoji')}</div>
                                <div>
                                  <div className="text-sm font-bold">
                                    {t('envelopeType.random.title')}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {t('envelopeType.random.description')}
                                  </div>
                                </div>
                              </Label>
                            </div>
                            <div
                              className={cn(
                                'flex cursor-pointer items-start space-x-2 rounded-lg border py-2 pl-1 pr-4 transition-all hover:border-primary',
                                field.value === 'average' && 'border-primary'
                              )}
                            >
                              <RadioGroupItem
                                value="average"
                                id="envelopeType-average"
                                className="sr-only"
                              />
                              <Label
                                htmlFor="envelopeType-average"
                                className="flex cursor-pointer items-start justify-start space-x-2"
                                onClick={() => {
                                  field.onChange('average');
                                }}
                              >
                                <div className="text-sm">{t('envelopeType.average.emoji')}</div>
                                <div>
                                  <div className="text-sm font-bold">
                                    {t('envelopeType.average.title')}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {t('envelopeType.average.description')}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalEnvelope"
                    render={({ field }) => (
                      <FormItem className="md:w-1/2">
                        <FormLabel>{t('quantity.label')}</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} readOnly={true} />
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
                          <Input
                            type="number"
                            min={0}
                            step={0.000000001}
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
                    name="requireTwitterBinding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('participationConditions.title')}</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={field.name}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <FormLabel htmlFor={field.name}>
                              {t('requireTwitterBinding.label')}
                            </FormLabel>
                          </div>
                        </FormControl>
                        <FormDescription>{t('requireTwitterBinding.description')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!isWalletConnected && (
                  <EnvelopeStatusExtendEndTimeButton
                    type="wallet-not-connected"
                    submitStatus={submitStatus}
                  />
                )}

                {isWalletConnected && walletAddress !== data.sender && (
                  <EnvelopeStatusExtendEndTimeButton type="not-owner" submitStatus={submitStatus} />
                )}

                {isWalletConnected &&
                  walletAddress === data.sender &&
                  data.status === 'ongoing' && (
                    <EnvelopeStatusExtendEndTimeButton type="ongoing" submitStatus={submitStatus} />
                  )}

                {isWalletConnected && walletAddress === data.sender && data.status === 'ended' && (
                  <EnvelopeStatusExtendEndTimeButton type="ended" submitStatus={submitStatus} />
                )}

                {isWalletConnected &&
                  walletAddress === data.sender &&
                  data.status === 'not-started' && (
                    <EnvelopeStatusExtendEndTimeButton
                      type="not-started"
                      submitStatus={submitStatus}
                    />
                  )}
              </form>
            </Form>

            <div className="mt-4 flex justify-center">
              <div
                onClick={() => {
                  const { activityName, startTime, endTime } = form.getValues();

                  const searchParams = new URLSearchParams();
                  searchParams.set('assetType', data.assetType);
                  searchParams.set('totalCoin', data.totalCoin.toString());
                  searchParams.set('totalEnvelope', data.totalEnvelope.toString());
                  searchParams.set('activityName', activityName);
                  searchParams.set('startTimeTimestamp', startTime.getTime().toString());
                  searchParams.set('endTimeTimestamp', endTime.getTime().toString());
                  searchParams.set('coverImageUrl', data.coverImageUrl);

                  const coin = coinBalancesResp.data.find((c) => c.coinType === data.coinType);
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
          </ActivityFormLayout.FormContainer>
        </ActivityFormLayout>
      </div>
    </div>
  );
}
