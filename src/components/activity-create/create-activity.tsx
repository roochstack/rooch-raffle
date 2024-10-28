'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreateActivityType } from '@/interfaces';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import CreateEnvelopeForm from './create-envelope-form';
import CreateRaffleForm from './create-raffle-form';

function CreateActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityType = (searchParams.get('type') as CreateActivityType) || 'envelope';
  const setActivityType = (type: CreateActivityType) => {
    router.push(`/create?type=${type}`);
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
            <h1 className="text-3xl font-bold">创建活动</h1>
            <div>
              <Tabs
                value={activityType}
                onValueChange={(value) => setActivityType(value as CreateActivityType)}
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
            </div>
          </div>
          {activityType === 'envelope' && <CreateEnvelopeForm />}
          {activityType === 'raffle' && <CreateRaffleForm />}
        </div>
      </div>
    </div>
  );
}

export default function CreateActivity() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateActivityPage />
    </Suspense>
  );
}
