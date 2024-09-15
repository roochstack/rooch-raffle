'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { ArrowDownUpIcon, ArrowUpRightIcon, Check, ImageUpIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccountNfts, useCoinBalances } from '@/hooks';
import { useCreateEnvelope } from '@/hooks/use-create-envelope';
import { cn } from '@/lib/utils';
import { formatUnits } from '@/utils/kit';
import { zodResolver } from '@hookform/resolvers/zod';
import { CoinLabel } from '../coin-label';
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ActivityFormLayout } from './activity-form-layout';
import Image from 'next/image';

const defaultCoverImageUrl = '/cover-6.png';

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
}

export default function CreateEnvelopeForm() {
  const { create: createEnvelope } = useCreateEnvelope();
  const coinBalancesResp = useCoinBalances();
  const nftQueryResult = useAccountNfts();
  const [submitStatus, setSubmitStatus] = useState<LoadingButtonStatus>('idle');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverImageUrl, setCoverImageUrl] = useState(defaultCoverImageUrl);

  const formSchema = useMemo(() => {
    const schema = z
      .object({
        activityName: z.string().min(1).max(200),
        startTime: z.date(),
        endTime: z.date(),
        coinType: z.string().optional(),
        assetType: z.enum(['coin', 'nft']),
        envelopeType: z.enum(['random', 'average']),
        totalEnvelope: z.union([
          z.literal(''),
          z.string().regex(/^\d+$/, { message: '个数不能为空' }),
        ]),
        totalCoin: z.union([
          z.literal(''),
          z.string().regex(/^\d+(\.\d+)?$/, { message: '金额不能为空' }),
        ]),
        nfts: z.array(z.string()),
      })
      .refine(
        (data) => {
          if (data.assetType === 'coin') {
            return !!data.coinType;
          }
          return true;
        },
        {
          message: '请选择奖励内容',
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
          message: '金额不能为空',
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
          message: '红包个数不能为空',
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
        { message: '超过了可用余额', path: ['totalCoin'] }
      )
      .refine(
        (data) => {
          return data.endTime > data.startTime;
        },
        {
          message: '结束时间不能早于开始时间',
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
          message: 'NFT 不能为空',
          path: ['nfts'],
        }
      );

    return schema;
  }, [coinBalancesResp.data]);

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
    },
  });

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 100 * 1024) {
      // 限制文件大小不超过 100KB
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setCoverImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      alert('请选择不超过 100KB 的图片文件');
    }
  };

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
          : BigInt(Number(data.totalCoin) * Number(data.totalEnvelope) * 10 ** selectedCoin.decimals);

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
        <img src={coverImageUrl} alt="cover image" className="h-full w-full object-cover" />
        <div
          className="absolute bottom-4 right-4 cursor-pointer rounded-lg border border-gray-200 bg-gray-900 p-1.5 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageUpIcon className="h-4 w-4 text-gray-200" />
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
                    <FormLabel>红包标题</FormLabel>
                    <FormControl>
                      <Input placeholder="恭喜发财！" {...field} />
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
                      <FormLabel>开始</FormLabel>
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
                      <FormLabel>结束</FormLabel>
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
                    <FormLabel>资产类型</FormLabel>
                    <FormControl>
                      <RadioGroup
                        className="flex"
                        {...field}
                        onValueChange={(v) => {
                          field.onChange(v);
                        }}
                      >
                        <>
                          <RadioGroupItem value="coin" id="assetType-coin" className="sr-only" />
                          <Label
                            htmlFor="assetType-coin"
                            className={cn(
                              'flex min-w-[124px] cursor-pointer items-start justify-start space-x-2 rounded-lg border py-2 pl-3 pr-4 transition-all hover:border-primary',
                              field.value === 'coin' && 'border-primary'
                            )}
                          >
                            <div className="text-sm">🪙</div>
                            <div className="text-sm">Coin</div>
                          </Label>
                        </>

                        <>
                          <RadioGroupItem value="nft" id="assetType-nft" className="sr-only" />
                          <Label
                            htmlFor="assetType-nft"
                            className={cn(
                              'flex min-w-[124px] cursor-pointer items-start justify-start space-x-2 rounded-lg border py-2 pl-3 pr-4 transition-all hover:border-primary',
                              field.value === 'nft' && 'border-primary'
                            )}
                          >
                            <div className="text-sm">🖼️</div>
                            <div className="text-sm">NFT</div>
                          </Label>
                        </>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>这是领取红包时可以获得的东西</FormDescription>
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
                      <FormLabel>红包类型</FormLabel>
                      <FormControl>
                        <RadioGroup className="flex" {...field}>
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
                              <div className="text-sm">🎲</div>
                              <div>
                                <div className="text-sm font-bold">拼手气</div>
                                <div className="text-xs text-gray-500">红包金额随机</div>
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
                              <div className="text-sm">⚖️</div>
                              <div>
                                <div className="text-sm font-bold">普通</div>
                                <div className="text-xs text-gray-500">红包金额相同</div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
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
                      <FormLabel>奖励内容</FormLabel>
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
                                  'Loading...'
                                ) : (
                                  '选择 Coin'
                                )}
                                <ArrowDownUpIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput placeholder="Search coin..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>No coin found.</CommandEmpty>
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
                          可用余额：
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
                      <FormLabel>奖励内容</FormLabel>
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
                                  '选择 NFT'
                                )}
                                <ArrowDownUpIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput placeholder="Search NFT..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>No nft found.</CommandEmpty>
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
                      <FormLabel>红包个数</FormLabel>
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
                        {form.watch('envelopeType') === 'random' ? '总金额' : '单个金额'}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step={0.000000001} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <LoadingButton
              type="submit"
              size="lg"
              className="h-12 w-full min-w-[140px] text-base"
              status={submitStatus}
              loadingText="Waiting..."
              successText="创建成功"
              errorText="创建失败"
              successIcon={<span className="mr-2 text-base">✅</span>}
            >
              🧧 创建红包活动
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

              const coin = coinBalancesResp.data.find((c) => c.coinType === coinType);
              if (coin) {
                searchParams.set('coinType', coin.coinType);
                searchParams.set('coinName', coin.name);
                searchParams.set('coinSymbol', coin.symbol);
              }

              window.open(`/activities/envelope/preview?${searchParams.toString()}`, '_blank');
            }}
            className="inline-flex cursor-pointer items-center justify-center text-sm text-gray-500 transition-all hover:text-gray-700 hover:underline"
          >
            <span>预览活动页面</span>
            <ArrowUpRightIcon className="ml-1 h-4 w-4" />
          </div>
        </div>
      </ActivityFormLayout.FormContainer>
    </ActivityFormLayout>
  );
}
