import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto min-h-[calc(100vh-118px)] max-w-5xl p-6 pt-20">
      <div className="fixed left-0 top-0 z-[-1] h-44 w-full bg-gradient-to-b from-[#f0f4fa] to-muted/0"></div>

      <div className="mx-auto mt-16 max-w-2xl text-center">
        <div>
          <div className="">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">透明公开的抽奖和红包体验</h1>
            <div className="mt-5 text-lg leading-8">通过 Bitcoin 区块头生成的随机数，确保抽奖过程不可篡改，保障用户的每一次参与都安全可靠。</div>
          </div>
          <div className="mt-9 flex justify-center gap-5">
            <Button>
              <Link href="/create">创建第一个活动</Link>
            </Button>
            <Button variant="secondary">
              <Link href="/activities" className="flex items-center">
                <span>管理活动</span> <ArrowRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
