'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { ArrowUpRightIcon, ImageUpIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { useCreateRaffle } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { DateTimePicker } from '../ui/date-time-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { LoadingButton, LoadingButtonStatus } from '../ui/loading-button';
import { Textarea } from '../ui/textarea';
import { ActivityFormLayout } from './activity-form-layout';
import { useTranslations } from 'next-intl';

interface FormValues {
  activityName: string;
  rewardInfo: string;
  startTime: Date;
  endTime: Date;
  totalAmount: string;
  rewardAmount: string;
}

const MAX_U64 = '18446744073709551615';
const defaultCoverImageUrl = '/cover-4.png';

export default function CreateRaffleForm() {
  const t = useTranslations();

  const formSchema = z
    .object({
      activityName: z.string().min(1).max(200),
      rewardInfo: z.string().min(1).max(1000),
      startTime: z.date(),
      endTime: z.date(),
      totalAmount: z.union([z.string().regex(/^\d+$/), z.literal('')]),
      rewardAmount: z.string().regex(/^\d+$/, {
        message: t('activities.create.form.validation.rewardAmountRequired')
      }),
    })
    .refine(
      (data) => {
        return data.endTime > data.startTime;
      },
      {
        message: t('activities.create.form.validation.endTimeInvalid'),
        path: ['endTime'],
      }
    )
    .refine(
      (data) => {
        if (data.totalAmount && data.rewardAmount) {
          const total = parseInt(data.totalAmount);
          const reward = parseInt(data.rewardAmount);
          return reward <= total;
        }
        return true;
      },
      {
        message: t('activities.create.form.validation.rewardAmountExceeded'),
        path: ['rewardAmount'],
      }
    );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityName: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      totalAmount: '',
      rewardAmount: '',
    },
  });
  const { create: createRaffle } = useCreateRaffle();
  const router = useRouter();
  const [submitStatus, setSubmitStatus] = useState<LoadingButtonStatus>('idle');
  const [coverImageUrl, setCoverImageUrl] = useState(defaultCoverImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: FormValues) => {
    if (submitStatus === 'success') {
      return;
    }

    setSubmitStatus('loading');

    data.startTime.setSeconds(0);
    data.startTime.setMilliseconds(0);
    data.endTime.setSeconds(0);
    data.endTime.setMilliseconds(0);

    try {
      console.log('onSubmit', data);
      const { id: newRaffleId } = await createRaffle({
        themeMode: 0,
        colorMode: 0,
        description: '',
        activityName: data.activityName,
        rewardInfo: data.rewardInfo,
        startTime: data.startTime,
        endTime: data.endTime,
        totalAmount: data.totalAmount || MAX_U64,
        rewardAmount: data.rewardAmount,
        coverImageUrl,
      });
      setSubmitStatus('success');
      window.setTimeout(() => {
        router.push(`/activities/raffle/manage/${newRaffleId}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating envelope', error);
      setSubmitStatus('error');
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 100 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setCoverImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      alert(t('activities.create.form.imageUpload.sizeLimit'));
    }
  };

  return (
    <ActivityFormLayout>
      <ActivityFormLayout.ImageContainer className="hover:[&_div]:bg-gray-600">
        <img src={coverImageUrl} alt="cover image" className="w-full object-cover" />
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
                    <FormLabel>{t('activities.create.form.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('activities.create.form.namePlaceholder')} {...field} />
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
                      <FormLabel>{t('time.startTime')}</FormLabel>
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
                      <FormLabel>{t('time.endTime')}</FormLabel>
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
                name="rewardInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('activities.create.form.reward.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('activities.create.form.raffle.rewardInfoPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel>{t('activities.create.form.raffle.totalAmount')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('activities.create.form.raffle.totalAmountPlaceholder')}
                        type="number"
                        min={1}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rewardAmount"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel>{t('activities.create.form.raffle.rewardAmount')}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
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
              loadingText={t('common.waiting')}
              successText={t('common.success')}
              errorText={t('common.error')}
              successIcon={<span className="mr-2 text-base">✅</span>}
            >
              {t('activities.create.button.createRaffle')}
            </LoadingButton>
          </form>
        </Form>
        <div className="mt-4 flex justify-center">
          <Link
            href="/activities/raffle/preview"
            className="inline-flex cursor-pointer items-center justify-center text-sm text-gray-500 transition-all hover:text-gray-700 hover:underline"
          >
            <span>{t('common.previewPage')}</span>
            <ArrowUpRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </ActivityFormLayout.FormContainer>
    </ActivityFormLayout>
  );
}
