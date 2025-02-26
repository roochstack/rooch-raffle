'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useAccountNfts, useCoinBalances } from '@/hooks';
import { useCreateEnvelope } from '@/hooks/use-create-envelope';
import { useActivityImageUpload } from '@/hooks/use-image-upload';
import { cn } from '@/lib/utils';
import { formatCoverImageUrl, formatUnits, getRandomCoverImageUrl } from '@/utils/kit';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownUpIcon, ArrowUpRightIcon, Check, ImageIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CoinLabel } from '../coin-label';
import { CoverImageDialog } from '../cover-image-dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { DateTimePicker } from '../ui/date-time-picker';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { LoadingButton, LoadingButtonStatus } from '../ui/loading-button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { RadioCardGroup } from '../ui/radio-card-group';
import { ActivityFormLayout } from './activity-form-layout';

interface FormValues {
  activityName: string;
  startTime: Date;
  endTime: Date;
  coinType: string;
  assetType: 'coin' | 'nft';
  envelopeType: 'random' | 'average';
  nfts: string[];
  totalEnvelope: string;
  totalCoin: string;
  requireTwitterBinding: boolean;
}

export default function CreateEnvelopeForm() {
  const locale = useLocale();
  const t = useTranslations('activities.create.form');
  const tCommon = useTranslations('common');
  const tButton = useTranslations('activities.create.button');
  const { create: createEnvelope } = useCreateEnvelope();
  const coinBalancesResp = useCoinBalances();
  const nftQueryResult = useAccountNfts();
  const [submitStatus, setSubmitStatus] = useState<LoadingButtonStatus>('idle');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverImageUrl, setCoverImageUrl] = useState(getRandomCoverImageUrl());
  const [coverImageDialogOpen, setCoverImageDialogOpen] = useState(false);

  const formSchema = useMemo(() => {
    const schema = z
      .object({
        activityName: z
          .string()
          .min(1, { message: t('validation.nameRequired') })
          .max(200),
        startTime: z.date(),
        endTime: z.date(),
        coinType: z.string().optional(),
        assetType: z.enum(['coin', 'nft']),
        envelopeType: z.enum(['random', 'average']),
        totalEnvelope: z.union([
          z.literal(''),
          z.string().regex(/^\d+$/, { message: t('validation.quantityRequired') }),
        ]),
        totalCoin: z.union([
          z.literal(''),
          z.string().regex(/^\d+(\.\d+)?$/, { message: t('validation.amountRequired') }),
        ]),
        nfts: z.array(z.string()),
        requireTwitterBinding: z.boolean(),
      })
      .refine(
        (data) => {
          if (data.assetType === 'coin') {
            return !!data.coinType;
          }
          return true;
        },
        {
          message: t('validation.rewardRequired'),
          path: ['coinType'],
        }
      )
      .refine(
        (data) => {
          if (data.assetType === 'coin') {
            return !!data.totalCoin;
          }
          return true;
        },
        {
          message: t('validation.amountRequired'),
          path: ['totalCoin'],
        }
      )
      .refine(
        (data) => {
          if (data.assetType === 'coin') {
            return !!data.totalEnvelope;
          }
          return true;
        },
        {
          message: t('validation.quantityRequired'),
          path: ['totalEnvelope'],
        }
      )
      // check balance
      .refine(
        (data) => {
          if (!data.coinType || coinBalancesResp.data.length === 0 || !data.totalCoin) {
            return true;
          }
          const coin = coinBalancesResp.data.find((coin) => coin.coinType === data.coinType);
          if (!coin) {
            return true;
          }

          if (data.envelopeType === 'average') {
            if (!data.totalEnvelope) {
              return true;
            }
            const totalCoin = parseFloat(data.totalCoin) * Number(data.totalEnvelope);
            const numValue = totalCoin * 10 ** coin.decimals;
            return numValue <= coin.balance;
          }

          const totalCoin = parseFloat(data.totalCoin);
          const numValue = totalCoin * 10 ** coin.decimals;
          return numValue <= coin.balance;
        },
        { message: t('validation.balanceExceeded'), path: ['totalCoin'] }
      )
      .refine(
        (data) => {
          return data.endTime > data.startTime;
        },
        {
          message: t('validation.endTimeInvalid'),
          path: ['endTime'],
        }
      )
      .refine(
        (data) => {
          if (data.assetType === 'nft') {
            return data.nfts.length > 0;
          }
          return true;
        },
        {
          message: t('validation.nftEmpty'),
          path: ['nfts'],
        }
      );

    return schema;
  }, [t, coinBalancesResp.data]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityName: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assetType: 'coin',
      envelopeType: 'random',
      totalEnvelope: '',
      totalCoin: '',
      nfts: [],
      requireTwitterBinding: false,
    },
  });

  const handleImageUpload = useActivityImageUpload({
    onImageChange: setCoverImageUrl,
    sizeLimit: 100,
    onSizeExceeded: () => {
      alert(t('imageUpload.sizeLimit'));
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (submitStatus === 'success') {
      return;
    }

    data.startTime.setSeconds(0);
    data.startTime.setMilliseconds(0);
    data.endTime.setSeconds(0);
    data.endTime.setMilliseconds(0);

    let submitData;
    if (data.assetType === 'nft') {
      const nftType = nftQueryResult.data!.find((n) => data.nfts.includes(n.id))!.type;
      submitData = {
        assetType: 'nft' as const,
        activityName: data.activityName,
        description: '',
        coverImageUrl,
        themeMode: 0,
        colorMode: 0,
        nftType,
        nfts: data.nfts,
        startTime: data.startTime,
        endTime: data.endTime,
      };
    } else if (data.assetType === 'coin') {
      const selectedCoin = coinBalancesResp.data.find((coin) => coin.coinType === data.coinType)!;
      const formattedTotalCoin =
        data.envelopeType === 'random'
          ? BigInt(Number(data.totalCoin) * 10 ** selectedCoin.decimals)
          : BigInt(
            Number(data.totalCoin) * Number(data.totalEnvelope) * 10 ** selectedCoin.decimals
          );

      submitData = {
        assetType: 'coin' as const,
        activityName: data.activityName,
        description: '',
        coverImageUrl,
        themeMode: 0,
        colorMode: 0,
        envelopeType: data.envelopeType,
        coinType: data.coinType,
        totalCoin: formattedTotalCoin.toString(),
        totalEnvelope: data.totalEnvelope,
        startTime: data.startTime,
        endTime: data.endTime,
        requireTwitterBinding: data.requireTwitterBinding,
      };
    }

    try {
      console.log('onSubmit', data);
      setSubmitStatus('loading');
      const { id: newEnvelopeId } = await createEnvelope(submitData!);
      setSubmitStatus('success');
      window.setTimeout(() => {
        router.push(`/activities/envelope/manage/${newEnvelopeId}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating envelope', error);
      setSubmitStatus('error');
    }
  };

  return (
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
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('assetType.label')}</FormLabel>
                    <FormControl>
                      <RadioCardGroup
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

              {form.watch('assetType') === 'coin' && (
                <FormField
                  control={form.control}
                  name="envelopeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('envelopeType.label')}</FormLabel>
                      <FormControl>
                        <RadioCardGroup
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
              )}

              {form.watch('assetType') === 'coin' && (
                <FormField
                  control={form.control}
                  name="coinType"
                  render={({ field }) => (
                    <FormItem className="md:w-1/2">
                      <FormLabel>{t('reward.label')}</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'flex w-full justify-between',
                                  !field.value && 'font-normal text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  <CoinLabel
                                    {...coinBalancesResp.data.find(
                                      (coin) => coin.coinType === field.value
                                    )!}
                                  />
                                ) : coinBalancesResp.isLoading ? (
                                  t('reward.loading')
                                ) : (
                                  t('reward.selectCoin')
                                )}
                                <ArrowDownUpIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput placeholder={t('reward.searchCoin')} className="h-9" />
                              <CommandList>
                                <CommandEmpty>{t('reward.noCoinFound')}</CommandEmpty>
                                <CommandGroup>
                                  {coinBalancesResp.data.map((coin) => (
                                    <CommandItem
                                      value={coin.name}
                                      key={coin.coinType}
                                      onSelect={() => {
                                        form.setValue('coinType', coin.coinType);
                                      }}
                                    >
                                      <div className="flex w-full">
                                        {coin.iconString && (
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html: coin.iconString,
                                            }}
                                            className="mr-2 h-4 w-4"
                                          />
                                        )}

                                        <div>
                                          <div className="flex items-center justify-between">
                                            <div className="leading-none">{coin.name}</div>
                                          </div>
                                          <div className="mt-1 text-xs text-gray-500">
                                            {formatUnits(coin.balance, coin.decimals)}
                                          </div>
                                        </div>

                                        <Check
                                          className={cn(
                                            'ml-auto h-4 w-4',
                                            coin.coinType === field.value
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          )}
                                        />
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      {field.value && (
                        <FormDescription>
                          {t('reward.balance')}
                          {formatUnits(
                            coinBalancesResp.data.find((coin) => coin.coinType === field.value)
                              ?.balance ?? 0n,
                            coinBalancesResp.data.find((coin) => coin.coinType === field.value)
                              ?.decimals
                          )}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch('assetType') === 'nft' && (
                <FormField
                  control={form.control}
                  name="nfts"
                  render={({ field }) => (
                    <FormItem className="md:w-1/2">
                      <FormLabel>{t('reward.label')}</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'flex w-full justify-between',
                                  !field.value && 'font-normal text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  <div className="max-w-[200px] truncate">
                                    {nftQueryResult.data
                                      ?.filter((nft) => field.value?.includes(nft.id))!
                                      .map((nft) => nft.name)
                                      .join(', ')}
                                  </div>
                                ) : nftQueryResult.isLoading ? (
                                  'Loading...'
                                ) : (
                                  t('reward.selectNFT')
                                )}
                                <ArrowDownUpIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput placeholder="Search NFT..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>{t('reward.noNFTFound')}</CommandEmpty>
                                <CommandGroup>
                                  {nftQueryResult.data?.map((nft) => (
                                    <CommandItem
                                      value={nft.id}
                                      key={nft.id}
                                      onSelect={() => {
                                        form.setValue('nfts', [...field.value, nft.id]);
                                      }}
                                    >
                                      <div className="flex w-full">
                                        {nft.imageUrl && nft.imageUrl.startsWith('http') ? (
                                          <img
                                            src={nft.imageUrl}
                                            alt="nft image"
                                            className="mr-2 h-8 w-8"
                                            width={20}
                                            height={20}
                                          />
                                        ) : (
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html: nft.imageUrl,
                                            }}
                                            className="mr-2 h-8 w-8"
                                          />
                                        )}

                                        <div>
                                          <div className="flex items-center justify-between">
                                            <div className="leading-none">{nft.name}</div>
                                          </div>
                                          <div className="mt-1 text-xs text-gray-500">
                                            {nft.description}
                                          </div>
                                        </div>

                                        <Check
                                          className={cn(
                                            'ml-auto h-4 w-4',
                                            field.value?.includes(nft.id)
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          )}
                                        />
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch('assetType') === 'coin' && (
                <FormField
                  control={form.control}
                  name="totalEnvelope"
                  render={({ field }) => (
                    <FormItem className="md:w-1/2">
                      <FormLabel>{t('quantity.label')}</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch('assetType') === 'coin' && (
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
                        <Input type="number" min={0} step={0.000000001} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
            <LoadingButton
              type="submit"
              size="lg"
              className="h-12 w-full min-w-[140px] text-base"
              status={submitStatus}
              loadingText={tCommon('loading')}
              successText={tCommon('success')}
              errorText={tCommon('error')}
              successIcon={<span className="mr-2 text-base">✅</span>}
            >
              {tButton('createEnvelope')}
            </LoadingButton>
          </form>
        </Form>

        <div className="mt-4 flex justify-center">
          <div
            onClick={() => {
              const {
                assetType,
                activityName,
                coinType,
                startTime,
                endTime,
                totalCoin,
                totalEnvelope,
                nfts,
              } = form.getValues();

              const searchParams = new URLSearchParams();
              searchParams.set('assetType', assetType);
              searchParams.set('totalCoin', totalCoin);
              searchParams.set('totalEnvelope', totalEnvelope);
              searchParams.set('activityName', activityName);
              searchParams.set('startTimeTimestamp', startTime.getTime().toString());
              searchParams.set('endTimeTimestamp', endTime.getTime().toString());
              searchParams.set('nftCount', nfts.length.toString());
              searchParams.set('coverImageUrl', coverImageUrl);

              const coin = coinBalancesResp.data.find((c) => c.coinType === coinType);
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
  );
}
