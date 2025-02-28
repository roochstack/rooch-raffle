'use client';

import { ActivityFormLayout } from '@/components/activity-create/activity-form-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export default function EditCoinEnvelopeActivitySkeleton() {
  const tEdit = useTranslations('activities.envelope.edit');

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
              <Skeleton className="h-full w-full" />
            </ActivityFormLayout.ImageContainer>

            <ActivityFormLayout.FormContainer>
              <div className="space-y-10 rounded-lg bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  {/* 活动名称 */}
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* 开始和结束时间 */}
                  <div className="flex gap-4 max-md:flex-col md:items-center">
                    <div className="space-y-2 md:w-1/2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2 md:w-1/2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>

                  {/* 资产类型 */}
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="flex">
                      <Skeleton className="h-12 w-32" />
                    </div>
                    <Skeleton className="h-4 w-72" />
                  </div>

                  {/* 红包类型 */}
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-20 w-1/2" />
                      <Skeleton className="h-20 w-1/2" />
                    </div>
                  </div>

                  {/* 红包数量 */}
                  <div className="space-y-2 md:w-1/2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* 红包金额 */}
                  <div className="space-y-2 md:w-1/2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* Twitter 绑定要求 */}
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <Skeleton className="h-4 w-72" />
                  </div>
                </div>

                {/* 底部按钮 */}
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="mt-4 flex justify-center">
                <Skeleton className="h-5 w-24" />
              </div>
            </ActivityFormLayout.FormContainer>
          </ActivityFormLayout>
        </div>
      </div>
    </div>
  );
}
