'use client';

import { CreateActivityType } from '@/interfaces';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { EnvelopeTable } from './envelope-table';
import { RaffleTable } from './raffle-table';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

function ActivitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityType = (searchParams.get('type') as CreateActivityType) || 'envelope';
  const setActivityType = (type: CreateActivityType) => {
    router.replace(`/activities?type=${type}`);
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
      <div className="mx-auto max-w-5xl space-y-6 p-6 pt-11">
        <h1 className="text-3xl font-bold">我的活动</h1>
        <div className="flex items-center justify-between">
          <Tabs
            value={activityType}
            onValueChange={(value) => setActivityType(value as 'raffle' | 'envelope')}
          >
            <TabsList className="rounded-2 grid w-full grid-cols-2 bg-muted">
              <TabsTrigger
                value="envelope"
                className="rounded-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-500 data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
              >
                <span
                  className={cn(
                    'mr-2 opacity-50 transition-all',
                    activityType === 'envelope' && 'opacity-100'
                  )}
                >
                  🧧
                </span>
                红包
              </TabsTrigger>
              <TabsTrigger
                disabled
                value="raffle"
                className="rounded-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-500 data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
              >
                <span
                  className={cn(
                    'mr-2 opacity-50 transition-all',
                    activityType === 'raffle' && 'opacity-100'
                  )}
                >
                  🎁
                </span>
                抽奖
              </TabsTrigger>

            </TabsList>
          </Tabs>

          <Button onClick={() => router.push(`/create?type=${activityType}`)}>
            <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-full border border-current">
              <Plus className="h-3 w-3" />
            </div>
            创建活动
          </Button>
        </div>
        <div>
          <div className="space-y-4">
            {activityType === 'raffle' && <RaffleTable />}
            {activityType === 'envelope' && <EnvelopeTable />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Activities() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActivitiesPage />
    </Suspense>
  );
}
