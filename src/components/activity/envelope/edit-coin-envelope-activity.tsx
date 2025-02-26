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
import { useUpdateEnvelope } from '@/hooks/use-update-envelope';
import { CoinEnvelopeItem } from '@/interfaces';
import { formatCoverImageUrl } from '@/utils/kit';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpRightIcon, ImageIcon } from 'lucide-react';
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

export default function EditCoinEnvelopeActivity({ data }: ActivityProps) {
  const locale = useLocale();
  const coinBalancesResp = useCoinBalances();
  const updateEnvelope = useUpdateEnvelope();
  const walletAddress = useWalletHexAddress();
  const { isConnected: isWalletConnected } = useCurrentWallet();
  const [coverImageUrl, setCoverImageUrl] = useState(data.coverImageUrl);
  const [coverImageDialogOpen, setCoverImageDialogOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<LoadingButtonStatus>('idle');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('activities.create.form');
  const tCommon = useTranslations('common');
  const tEdit = useTranslations('activities.envelope.edit');

  useEffect(() => {
    if (data.totalCoin && data.totalEnvelope && data.envelopeType === 'average') {
      form.setValue('totalCoin', (Number(data.totalCoin) / Number(data.totalEnvelope)).toString());
    }
  }, [data]);

  const formSchema = useMemo(() => {
    const schema = z
      .object({
        activityName: z
          .string()
          .min(1, { message: t('validation.nameRequired') })
          .max(200),
        startTime: z.date(),
        endTime: z.date(),
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
      requireTwitterBinding: data.requireTwitterBinding,
      assetType: data.assetType,
      envelopeType: data.envelopeType,
      totalEnvelope: data.totalEnvelope.toString(),
      // TODO，显示总金额
      totalCoin:
        data.envelopeType === 'random'
          ? data.totalCoin.toString()
          : (Number(data.totalCoin) / Number(data.totalEnvelope)).toString(),
    },
  });

  const handleImageUpload = useActivityImageUpload({
    onImageChange: setCoverImageUrl,
    sizeLimit: 100,
    onSizeExceeded: () => {
      alert(t('imageUpload.sizeLimit'));
    },
  });

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
      await updateEnvelope(data.id, submitData);
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
                      disabled={true}
                      control={form.control}
                      name="assetType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('assetType.label')}</FormLabel>
                          <FormControl>
                            <RadioCardGroup
                              disabled={field.disabled}
                              options={[
                                {
                                  value: 'coin',
                                  id: 'assetType-coin',
                                  emoji: t('assetType.coin.emoji'),
                                  label: t('assetType.coin.label')
                                },
                                {
                                  value: 'nft',
                                  id: 'assetType-nft',
                                  emoji: t('assetType.nft.emoji'),
                                  label: t('assetType.nft.label')
                                }
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

                    <FormField
                      disabled={true}
                      control={form.control}
                      name="envelopeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('envelopeType.label')}</FormLabel>
                          <FormControl>
                            <RadioCardGroup
                              disabled={field.disabled}
                              variant="detailed"
                              options={[
                                {
                                  value: 'random',
                                  id: 'envelopeType-random',
                                  emoji: t('envelopeType.random.emoji'),
                                  label: t('envelopeType.random.title'),
                                  description: t('envelopeType.random.description')
                                },
                                {
                                  value: 'average',
                                  id: 'envelopeType-average',
                                  emoji: t('envelopeType.average.emoji'),
                                  label: t('envelopeType.average.title'),
                                  description: t('envelopeType.average.description')
                                }
                              ]}
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      disabled={true}
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
                      disabled={true}
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

                  {isWalletConnected && walletAddress === data.sender && data.status === 'ended' && (
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
                    const { activityName, startTime, endTime } = form.getValues();

                    const searchParams = new URLSearchParams();
                    searchParams.set('assetType', data.assetType);
                    searchParams.set('totalCoin', data.totalCoin.toString());
                    searchParams.set('totalEnvelope', data.totalEnvelope.toString());
                    searchParams.set('activityName', activityName);
                    searchParams.set('startTimeTimestamp', startTime.getTime().toString());
                    searchParams.set('endTimeTimestamp', endTime.getTime().toString());
                    searchParams.set('coverImageUrl', coverImageUrl);

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
