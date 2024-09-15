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

const MAX_U64 = '18446744073709551615';
const defaultCoverImageUrl = '/cover-4.png';

const formSchema = z
  .object({
    activityName: z.string().min(1).max(200),
    rewardInfo: z.string().min(1).max(1000),
    startTime: z.date(),
    endTime: z.date(),
    totalAmount: z.union([z.string().regex(/^\d+$/), z.literal('')]),
    rewardAmount: z.string().regex(/^\d+$/, { message: '单个奖品数量不能为空' }),
  })
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
      if (data.totalAmount && data.rewardAmount) {
        const total = parseInt(data.totalAmount);
        const reward = parseInt(data.rewardAmount);
        return reward <= total;
      }
      return true;
    },
    {
      message: '奖品数量不能超过总人数',
      path: ['rewardAmount'],
    }
  );

type FormValues = z.infer<typeof formSchema>;

export default function CreateRaffleForm() {
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
                    <FormLabel>活动标题</FormLabel>
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
                name="rewardInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>抽奖内容</FormLabel>
                    <FormControl>
                      <Textarea placeholder="请输入抽奖内容" {...field} />
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
                    <FormLabel>人数限制</FormLabel>
                    <FormControl>
                      <Input placeholder="默认无限制" type="number" min={1} {...field} />
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
                    <FormLabel>奖品数量</FormLabel>
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
              loadingText="Waiting..."
              successText="Created Successfully"
              errorText="Failed to create"
              successIcon={<span className="mr-2 text-base">✅</span>}
            >
              🎁 创建抽奖活动
            </LoadingButton>
          </form>
        </Form>
        <div className="mt-4 flex justify-center">
          <Link
            href="/activities/raffle/preview"
            className="inline-flex cursor-pointer items-center justify-center text-sm text-gray-500 transition-all hover:text-gray-700 hover:underline"
          >
            <span>预览活动页面</span>
            <ArrowUpRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </ActivityFormLayout.FormContainer>
    </ActivityFormLayout>
  );
}
